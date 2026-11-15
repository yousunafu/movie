// つながる世界史・冒頭3分 / 担当D = 文#31〜#39
//
// 2026-11-09 全面描き直し。作者の却下の言葉はこの2つ。
//   「AIっぽすぎるし、作り込んでないし、なんか違う」
//   「人のシルエットもいやだから具体的に描いて。時代検証しながらちゃんとわかりやすい格好をさせよう」
//
// 約束 (ここを外すと全部やり直しになる):
//  1. 1つの関数が1文ぶんの絵。<svg viewBox="0 0 1920 1080"> の中身だけを返す (SekaiArt)。
//     div / AbsoluteFill は使わない。字幕帯と通知カードは外側の枠が足す。
//  2. 背景は必ず敷く。素の方眼は0枚 (第16条)。
//  3. 主役は短辺の半分 (540px) 以上。小さい物を画面の真ん中にポツンと置くのが最悪の失敗。
//  4. 人は顔と表情を描く。無貌のシルエットと、逆光で真っ黒に潰すのは禁止。
//     実在の人物 (ハメネイ師・モジタバ師) は顔を描かず、黒いターバンと眼鏡で示す。
//     群衆には老若男女を混ぜる。人の形は枚ごとに新しく描く (使い回すと同じ顔が並ぶ)。
//  5. 必ず f で動く。出しっぱなしの静止画は作らない。1枚につき「事件」を1つ起こす。
//  6. 紙目・かすれ・線の揺れは SekaiScenes.tsx の InkLayer が全部の絵に掛けている。
//     各絵に書き足さない。画面全体に色フィルタも掛けない。物ごとに本当の色を置く。
//  7. uid は関数ごとに別の文字列にする。defs の id がぶつかると他の絵が壊れる。
//
// 寄りの縛り: 全景にしてよいのは #31 と #38 の2枚だけ。残り7枚は寄る。
// 顔が画面の高さの1/4 (270px) 以上になる寄りは #37 (兵の顔) と #39 (給油する男) に置いた。
// 舞台は2026年のイラン・ホルムズ海峡・日本。1988年の物 (サモワール・殉教者ポスター) は混ぜない。
//
// #39 は冒頭3分の着地。イランの話が視聴者の財布まで下りてくる1枚なので、
// この担当のなかでいちばん時間をかける。

import React from "react";
import { SEKAI_SERIF, SEKAI_FONT, YearTag, Cam, seg, easeOut, easeInOut, W, H } from "./parts";
import { WP, WarmStage, SekaiChrono, type SekaiArt } from "./world";

// ===================================================================
// この担当 (#31〜#39) だけで使う色
// ===================================================================
// world.tsx の WP は読むだけ (4人で同時に触るので書き換えない)。
// 台帳に無い色は枚ごとのローカル const に置く。

// この担当だけで使う札。world.tsx の LandPlate は export されていないので、
// 同じ字形 (生成り地・左に色の帯・明朝) をこのファイルの中に置く。
const Fuda: React.FC<{
  x: number;
  y: number;
  text: string;
  t?: number;
  size?: number;
  accent?: boolean;
  /** 左の帯の色だけ差し替える (報道パートは速報の赤) */
  tone?: string;
}> = ({ x, y, text, t = 1, size = 28, accent, tone }) => {
  const w = text.length * (size - 1) + 32;
  const h = size * 1.78;
  if (t <= 0) return null;
  return (
    <g opacity={t}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={3} fill={WP.kinari} />
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={5}
        height={h}
        fill={tone ?? (accent ? WP.sabi : WP.amber)}
      />
      <text
        x={x + 3}
        y={y + size * 0.37}
        fontFamily={SEKAI_SERIF}
        fontSize={size}
        fontWeight={700}
        fill={WP.line}
        textAnchor="middle"
      >
        {text}
      </text>
    </g>
  );
};

// ===================================================================
// #31 山「アメリカとイスラエルが、イランを空爆しました。」(全景可)
// ===================================================================
// 夜のテヘランの屋上。カメラは低い位置から空へ煽る。
// 夜でも人の顔と服の色を出す。影で気配を置くのはやらない。
const D31 = {
  sky: WP.nightSky,
  skyHi: "#16254A",
  skyFlash: "#4E6FA8",
  alborz: "#1A2440", // 背後のアルボルズ山脈 (テヘランは標高1200mの大都市)
  alborzSnow: "#8FA6C4", // その雪
  milad: "#223055", // ミラード・タワーの尖塔
  block: "#101A33", // 停電した街区
  blockWindow: "#3C4F7A",
  deck: "#2E3340", // 屋上のコンクリート (夜)
  deckLit: "#4A5468",
  parapet: "#272B36",
  coping: "#555D6E",
  wallSand: "#8A7A5C", // 遠くの閃光に照らされる砂色の壁
  wallSandLit: "#C2AC82",
  tileCyan: "#2E7E92", // 壁の水色のタイル
  tileCyanLit: "#6FC2D2",
  tank: "#1E6E8C", // 屋上の給水タンク (水色の鋼)
  tankLit: "#58A8C0",
  tankRust: "#7A4A2C",
  dish: "#3A4250", // 衛星アンテナ
  dishLit: "#7E8CA0",
  acBox: "#434A56", // 室外機
  acFin: "#5E687A",
  rope: "#6E6A5E", // 洗濯物のロープ
  laundryW: "#D8D4C6",
  laundryB: "#2B3F6A",
  laundryR: "#8E3A3A",
  tracer: "#FFD47A", // 迎撃の曳光
  tracerCore: "#FFF3C6",
  phoneGlow: "#6FC8FF", // 携帯の画面の青い光
  pajama: "#B9C3D6", // パジャマ (縞)
  pajamaStripe: "#6E7E9E",
  coat: "#2C3342", // その上に羽織ったコート
  roosari: "#8E3A4A", // あわてて被ったルーサリー
  manteau: "#3A3F4E",
  kidShirt: "#C8A64E",
  rojinShirt: "#CFC8B8",
  rojinVest: "#4A4336",
  hair: "#1C1A1C",
  hairGray: "#B8B4AC",
  line: "#161414",
};

// 屋上に出てきた住民。この枚のためだけに描く (他の枚では使わない)。
// 単位空間は身長600・足元 y=0・頭の中心 y=-560。scale(h/600) で置く。
const Okujo: React.FC<{
  x: number;
  y: number;
  h: number;
  kind: "pajama" | "roosari" | "kid" | "rojin";
  /** 0..1 携帯を空に向けて掲げる */
  armUp?: number;
  /** 0..1 下からの青い光 (携帯の画面) */
  lit?: number;
  /** 顔を少し振る */
  turn?: number;
  flip?: boolean;
}> = ({ x, y, h, kind, armUp = 0, lit = 0, turn = 0, flip }) => {
  const s = h / 600;
  const tilt = -12 - turn * 4; // 空を見上げている
  const skin = kind === "rojin" ? "#C9A989" : WP.skin;
  const cloth =
    kind === "pajama"
      ? D31.pajama
      : kind === "roosari"
        ? D31.manteau
        : kind === "kid"
          ? D31.kidShirt
          : D31.rojinShirt;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {/* 脚 */}
      <path
        d="M-34 0 L-34 -288 L-6 -288 L-8 0 Z"
        fill={kind === "pajama" ? D31.pajamaStripe : D31.coat}
        stroke={D31.line}
        strokeWidth={3}
      />
      <path
        d="M8 0 L6 -288 L34 -288 L34 0 Z"
        fill={kind === "pajama" ? D31.pajama : D31.coat}
        stroke={D31.line}
        strokeWidth={3}
      />
      {/* 履物 (サンダル・つっかけ) */}
      <rect x={-42} y={-16} width={40} height={16} rx={5} fill="#2A2520" stroke={D31.line} strokeWidth={2.4} />
      <rect x={4} y={-16} width={40} height={16} rx={5} fill="#2A2520" stroke={D31.line} strokeWidth={2.4} />
      {/* 胴 */}
      <path
        d="M-58 -292 Q-66 -430 -52 -500 L52 -500 Q66 -430 58 -292 Z"
        fill={cloth}
        stroke={D31.line}
        strokeWidth={3.4}
      />
      {/* パジャマの縞 */}
      {kind === "pajama" &&
        [0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={-56 + i * 24}
            y1={-296}
            x2={-50 + i * 24}
            y2={-498}
            stroke={D31.pajamaStripe}
            strokeWidth={6}
            opacity={0.8}
          />
        ))}
      {/* 羽織ったコート (パジャマの男・老人) */}
      {(kind === "pajama" || kind === "rojin") && (
        <>
          <path
            d="M-60 -296 Q-78 -420 -58 -498 L-22 -496 L-28 -300 Z"
            fill={kind === "rojin" ? D31.rojinVest : D31.coat}
            stroke={D31.line}
            strokeWidth={3}
          />
          <path
            d="M60 -296 Q78 -420 58 -498 L24 -496 L30 -300 Z"
            fill={kind === "rojin" ? D31.rojinVest : D31.coat}
            stroke={D31.line}
            strokeWidth={3}
          />
        </>
      )}
      {/* 長いマントー (女) */}
      {kind === "roosari" && (
        <path
          d="M-62 -210 Q-70 -380 -52 -500 L52 -500 Q70 -380 62 -210 Q0 -196 -62 -210 Z"
          fill={D31.manteau}
          stroke={D31.line}
          strokeWidth={3.2}
        />
      )}
      {/* 腕 (左) */}
      <path d="M-54 -488 Q-74 -400 -70 -322" fill="none" stroke={cloth} strokeWidth={26} strokeLinecap="round" />
      <path d="M-54 -488 Q-74 -400 -70 -322" fill="none" stroke={D31.line} strokeWidth={3} opacity={0.5} />
      <circle cx={-70} cy={-312} r={13} fill={skin} stroke={D31.line} strokeWidth={2.6} />
      {/* 腕 (右) ── armUp で空へ上げる */}
      <g transform={`rotate(${-150 * armUp} 54 -488)`}>
        <path d="M54 -488 Q74 -400 70 -322" fill="none" stroke={cloth} strokeWidth={26} strokeLinecap="round" />
        <path d="M54 -488 Q74 -400 70 -322" fill="none" stroke={D31.line} strokeWidth={3} opacity={0.5} />
        <circle cx={70} cy={-312} r={13} fill={skin} stroke={D31.line} strokeWidth={2.6} />
        {/* 携帯 */}
        {armUp > 0.2 && (
          <g transform="translate(70 -312) rotate(14)">
            <rect x={-15} y={-34} width={30} height={56} rx={4} fill="#1A1C22" stroke={D31.line} strokeWidth={2.6} />
            <rect x={-11} y={-29} width={22} height={46} rx={2} fill={D31.phoneGlow} opacity={0.92} />
          </g>
        )}
      </g>
      {/* 頭 */}
      <g transform={`rotate(${tilt} 0 -492)`}>
        <rect x={-15} y={-516} width={30} height={26} fill={skin} stroke={D31.line} strokeWidth={2.6} />
        <ellipse cx={0} cy={-560} rx={44} ry={50} fill={skin} stroke={D31.line} strokeWidth={3.2} />
        {/* 携帯の画面が顔を下から照らす */}
        {lit > 0 && (
          <ellipse cx={4} cy={-534} rx={34} ry={20} fill={D31.phoneGlow} opacity={0.3 * lit} />
        )}
        {/* 耳 */}
        <ellipse cx={-44} cy={-556} rx={7} ry={11} fill={skin} stroke={D31.line} strokeWidth={2.2} />
        <ellipse cx={44} cy={-556} rx={7} ry={11} fill={skin} stroke={D31.line} strokeWidth={2.2} />
        {/* 髪・被り物 */}
        {kind === "pajama" && (
          <path
            d="M-44 -568 Q-40 -614 0 -612 Q40 -614 44 -568 Q30 -592 0 -590 Q-28 -592 -44 -568 Z"
            fill={D31.hair}
          />
        )}
        {kind === "kid" && (
          <path d="M-45 -560 Q-46 -616 0 -616 Q46 -616 45 -560 Q24 -586 0 -584 Q-24 -586 -45 -560 Z" fill={D31.hair} />
        )}
        {kind === "rojin" && (
          <>
            <path d="M-45 -556 Q-44 -586 -30 -598 Q-34 -572 -44 -548 Z" fill={D31.hairGray} />
            <path d="M45 -556 Q44 -586 30 -598 Q34 -572 44 -548 Z" fill={D31.hairGray} />
            {/* 白い顎髭 */}
            <path d="M-28 -528 Q0 -500 28 -528 Q20 -498 0 -492 Q-20 -498 -28 -528 Z" fill="#E2DED4" />
          </>
        )}
        {kind === "roosari" && (
          <>
            {/* 前に髪が少し見えている (あわてて被った) */}
            <path d="M-42 -574 Q-30 -606 0 -604 Q14 -604 24 -594 Q4 -592 -14 -580 Z" fill={D31.hair} />
            {/* ルーサリー。頭をまわって肩に落ちる一枚布 */}
            <path
              d="M-50 -556 Q-54 -616 0 -620 Q56 -618 50 -554 L62 -470 Q36 -452 0 -454 Q-38 -452 -62 -470 Z"
              fill={D31.roosari}
              stroke={D31.line}
              strokeWidth={3}
            />
            {/* 顔の穴 */}
            <ellipse cx={0} cy={-562} rx={36} ry={44} fill={skin} stroke={D31.line} strokeWidth={2.4} />
            <path d="M-38 -572 Q0 -592 38 -572" fill="none" stroke={D31.line} strokeWidth={2.4} opacity={0.5} />
          </>
        )}
        {/* 眉 (驚いて上がっている) */}
        <path d="M-30 -584 Q-19 -592 -8 -584" fill="none" stroke={D31.line} strokeWidth={3.4} strokeLinecap="round" />
        <path d="M8 -584 Q19 -592 30 -584" fill="none" stroke={D31.line} strokeWidth={3.4} strokeLinecap="round" />
        {/* 目 (見上げているので白目＋瞳) */}
        <ellipse cx={-18} cy={-564} rx={11} ry={8.4} fill="#F4F1EA" stroke={D31.line} strokeWidth={2.2} />
        <ellipse cx={18} cy={-564} rx={11} ry={8.4} fill="#F4F1EA" stroke={D31.line} strokeWidth={2.2} />
        <circle cx={-17} cy={-567} r={5} fill={D31.line} />
        <circle cx={19} cy={-567} r={5} fill={D31.line} />
        <circle cx={-15.4} cy={-569} r={1.7} fill="#FFFFFF" />
        <circle cx={20.6} cy={-569} r={1.7} fill="#FFFFFF" />
        {/* 鼻 */}
        <path d="M1 -556 Q-5 -542 3 -538" fill="none" stroke={D31.line} strokeWidth={2.6} strokeLinecap="round" />
        {/* 口 (開いている) */}
        <ellipse cx={0} cy={-522} rx={11} ry={8} fill="#5A2A2A" stroke={D31.line} strokeWidth={2.4} />
      </g>
    </g>
  );
};

const S31: SekaiArt = ({ f }) => {
  const uid = "d31";
  // 遠くの着弾の閃光。2回光る
  const fl = (a: number) => Math.max(0, 1 - Math.abs(f - a) / 7) ** 2;
  const flash = Math.min(1, fl(16) * 0.95 + fl(48) * 0.7);
  // 迎撃の曳光。3本が時間差で空へ伸びる
  const tracers = [
    { x0: 470, y0: 880, x1: 700, y1: 110, at: 4 },
    { x0: 1230, y0: 900, x1: 1020, y1: 50, at: 20 },
    { x0: 1700, y0: 870, x1: 1430, y1: 180, at: 36 },
  ];
  // 事件: 一人が携帯を空に向けて掲げる
  const lift = easeOut(seg(f, 30, 54));
  const sway = Math.sin(f / 13);
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D31.sky} />
          <stop offset="62%" stopColor={D31.skyHi} />
          <stop offset="100%" stopColor="#2A3A60" />
        </linearGradient>
        <linearGradient id={`${uid}-deck`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D31.deck} />
          <stop offset="100%" stopColor="#1C202A" />
        </linearGradient>
        <radialGradient id={`${uid}-flash`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE2A8" stopOpacity={0.95} />
          <stop offset="40%" stopColor="#FFB657" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#FF9A3C" stopOpacity={0} />
        </radialGradient>
      </defs>
      <Cam f={f} from={[0, 44, 1.1]} to={[0, -16, 1.0]} start={0} end={74}>
        {/* 夜空 */}
        <rect x={-200} y={-240} width={W + 400} height={1180} fill={`url(#${uid}-sky)`} />
        {/* 星 */}
        {Array.from({ length: 26 }, (_, i) => (
          <circle
            key={i}
            cx={90 + ((i * 317) % 1760)}
            cy={40 + ((i * 193) % 420)}
            r={i % 4 === 0 ? 2.4 : 1.5}
            fill={WP.star}
            opacity={0.5 + 0.3 * Math.sin(f / 9 + i)}
          />
        ))}
        {/* 背後のアルボルズ山脈。雪が載っている (砂漠とラクダではない) */}
        <path
          d="M-200 700 L140 540 L330 612 L560 452 L760 560 L980 470 L1200 596 L1420 500 L1640 590 L1920 520 L2120 700 Z"
          fill={D31.alborz}
        />
        <path d="M470 510 L560 452 L650 512 L600 500 L560 486 L520 500 Z" fill={D31.alborzSnow} opacity={0.9} />
        <path d="M900 522 L980 470 L1058 524 L1010 512 L980 500 L944 512 Z" fill={D31.alborzSnow} opacity={0.85} />
        <path d="M1352 548 L1420 500 L1492 550 L1450 540 L1420 528 L1388 540 Z" fill={D31.alborzSnow} opacity={0.8} />
        {/* 遠くの着弾の閃光 */}
        <circle cx={1180} cy={690} r={420} fill={`url(#${uid}-flash)`} opacity={flash} />
        {/* ミラード・タワーの尖塔 (この枚で自分から足した1つ) */}
        <g>
          <path d="M236 702 L252 500 L268 500 L284 702 Z" fill={D31.milad} />
          <ellipse cx={260} cy={486} rx={34} ry={22} fill={D31.milad} stroke="#44598C" strokeWidth={3} />
          <path d="M260 464 L260 430" stroke="#44598C" strokeWidth={4} />
          <circle cx={260} cy={426} r={5} fill={WP.alert} opacity={0.5 + 0.5 * Math.sin(f / 6)} />
        </g>
        {/* 停電した街区。灯っている窓はわずかで、残りは真っ暗 */}
        {[
          [-120, 648, 230, 250],
          [150, 690, 180, 210],
          [360, 660, 200, 240],
          [600, 700, 160, 200],
          [790, 672, 210, 230],
          [1030, 702, 170, 200],
          [1230, 664, 220, 240],
          [1480, 700, 180, 200],
          [1680, 668, 240, 240],
        ].map(([bx, by, bw, bh], i) => (
          <g key={i}>
            <rect x={bx} y={by} width={bw} height={bh} fill={D31.block} />
            {/* 閃光に照らされる砂色の壁と水色のタイル */}
            <rect x={bx} y={by} width={bw} height={bh} fill={D31.wallSand} opacity={0.14 + 0.5 * flash} />
            <rect
              x={bx + 14}
              y={by + bh - 70}
              width={bw - 28}
              height={26}
              fill={D31.tileCyan}
              opacity={0.5 + 0.45 * flash}
            />
            {Array.from({ length: 8 }, (_, k) => {
              const on = (i * 7 + k * 3) % 11 === 0;
              return (
                <rect
                  key={k}
                  x={bx + 16 + (k % 4) * ((bw - 40) / 4)}
                  y={by + 20 + Math.floor(k / 4) * 62}
                  width={28}
                  height={38}
                  fill={on ? D31.blockWindow : "#0A1122"}
                  opacity={on ? 0.9 : 0.8}
                />
              );
            })}
          </g>
        ))}
        {/* 迎撃の曳光が空に描く線 */}
        {tracers.map((t, i) => {
          const g = easeOut(seg(f, t.at, t.at + 26));
          if (g <= 0) return null;
          const cx = (t.x0 + t.x1) / 2 + (i % 2 ? 150 : -150);
          const cy = (t.y0 + t.y1) / 2;
          const px = (1 - g) * (1 - g) * t.x0 + 2 * (1 - g) * g * cx + g * g * t.x1;
          const py = (1 - g) * (1 - g) * t.y0 + 2 * (1 - g) * g * cy + g * g * t.y1;
          return (
            <g key={i}>
              <path
                d={`M${t.x0} ${t.y0} Q${cx} ${cy} ${t.x1} ${t.y1}`}
                fill="none"
                stroke={D31.tracer}
                strokeWidth={5}
                strokeLinecap="round"
                opacity={0.5 * (1 - g * 0.4)}
                strokeDasharray={1800}
                strokeDashoffset={1800 * (1 - g)}
              />
              <circle cx={px} cy={py} r={11} fill={D31.tracerCore} opacity={g < 1 ? 1 : 0} />
              <circle cx={px} cy={py} r={26} fill={D31.tracer} opacity={g < 1 ? 0.3 : 0} />
            </g>
          );
        })}
        {/* 屋上の手すり (老人が掴む) */}
        <g>
          {[1340, 1500, 1660, 1820].map((px) => (
            <rect key={px} x={px} y={840} width={11} height={120} fill={D31.coping} stroke={D31.line} strokeWidth={2.4} />
          ))}
          <line x1={1300} y1={862} x2={1920} y2={800} stroke={D31.coping} strokeWidth={13} strokeLinecap="round" />
          <line x1={1300} y1={900} x2={1920} y2={838} stroke={D31.coping} strokeWidth={8} strokeLinecap="round" />
        </g>
        {/* 屋上の床と腰壁 */}
        <rect x={-200} y={846} width={W + 400} height={48} fill={D31.parapet} />
        <rect x={-200} y={842} width={W + 400} height={9} fill={D31.coping} opacity={0.8} />
        <rect x={-200} y={892} width={W + 400} height={320} fill={`url(#${uid}-deck)`} />
        {[940, 1010, 1090, 1180].map((dy, i) => (
          <line
            key={i}
            x1={-200}
            y1={dy}
            x2={W + 200}
            y2={dy}
            stroke={D31.deckLit}
            strokeWidth={2.4}
            opacity={0.22}
          />
        ))}
        {/* 屋上の給水タンク */}
        <g>
          <rect x={96} y={838} width={16} height={60} fill="#20242E" />
          <rect x={268} y={838} width={16} height={60} fill="#20242E" />
          <rect x={70} y={602} width={240} height={240} rx={16} fill={D31.tank} stroke={D31.line} strokeWidth={4} />
          <ellipse cx={190} cy={602} rx={120} ry={26} fill={D31.tankLit} stroke={D31.line} strokeWidth={4} />
          <rect x={160} y={578} width={60} height={26} rx={5} fill={D31.tankLit} stroke={D31.line} strokeWidth={3} />
          <path d="M98 620 Q108 724 100 836" fill="none" stroke={D31.tankLit} strokeWidth={14} opacity={0.5} />
          <path d="M248 646 Q262 740 252 838" fill="none" stroke={D31.tankRust} strokeWidth={10} opacity={0.75} />
          <path d="M70 760 L310 760" stroke={D31.line} strokeWidth={3} opacity={0.4} />
          {/* 配管 */}
          <path d="M310 700 L420 700 L420 898" fill="none" stroke="#5A6270" strokeWidth={12} />
        </g>
        {/* 衛星アンテナの林 */}
        {[
          [430, 792, 46],
          [520, 806, 38],
          [610, 784, 52],
          [700, 812, 34],
          [790, 790, 44],
          [880, 806, 40],
        ].map(([dx, dy, r], i) => (
          <g key={i} transform={`translate(${dx} ${dy})`}>
            <rect x={-5} y={0} width={10} height={98} fill="#2A303C" />
            <rect x={-20} y={94} width={40} height={10} fill="#2A303C" />
            <g transform={`rotate(${-24 + (i % 3) * 9})`}>
              <ellipse cx={0} cy={-r * 0.3} rx={r} ry={r * 0.86} fill={D31.dish} stroke={D31.line} strokeWidth={3} />
              <ellipse
                cx={0}
                cy={-r * 0.3}
                rx={r * 0.72}
                ry={r * 0.6}
                fill={D31.dishLit}
                opacity={0.22 + 0.4 * flash}
              />
              <line x1={0} y1={-r * 0.3} x2={0} y2={-r * 1.4} stroke="#2A303C" strokeWidth={4} />
              <circle cx={0} cy={-r * 1.5} r={7} fill={D31.dishLit} />
            </g>
          </g>
        ))}
        {/* 室外機 */}
        {[
          [1150, 790],
          [1290, 806],
        ].map(([bx, by], i) => (
          <g key={i}>
            <rect x={bx} y={by} width={120} height={84} rx={5} fill={D31.acBox} stroke={D31.line} strokeWidth={3} />
            <circle cx={bx + 60} cy={by + 42} r={30} fill="#2B313C" stroke={D31.acFin} strokeWidth={3} />
            {[0, 1, 2].map((k) => (
              <path
                key={k}
                d={`M${bx + 60} ${by + 42} q${22 * Math.cos(((k * 120 + f * 7) * Math.PI) / 180)} ${
                  22 * Math.sin(((k * 120 + f * 7) * Math.PI) / 180)
                } ${28 * Math.cos(((k * 120 + f * 7 + 40) * Math.PI) / 180)} ${
                  28 * Math.sin(((k * 120 + f * 7 + 40) * Math.PI) / 180)
                }`}
                fill="none"
                stroke={D31.acFin}
                strokeWidth={4}
              />
            ))}
            <rect x={bx + 10} y={by + 90} width={100} height={8} fill="#22262E" />
          </g>
        ))}
        {/* 洗濯物のロープ */}
        <path d="M300 596 Q900 700 1520 584" fill="none" stroke={D31.rope} strokeWidth={4} />
        {[
          [470, 648, D31.laundryW, 60, 96],
          [600, 666, D31.laundryB, 72, 110],
          [740, 678, D31.laundryR, 54, 84],
          [880, 682, D31.laundryW, 80, 104],
          [1030, 672, D31.laundryB, 58, 92],
          [1190, 650, D31.laundryW, 66, 100],
        ].map(([lx, ly, c, lw, lh], i) => {
          const a = sway * (2 + (i % 3)) * 0.9;
          return (
            <g key={i} transform={`rotate(${a} ${lx} ${ly})`}>
              <rect
                x={(lx as number) - (lw as number) / 2}
                y={ly as number}
                width={lw as number}
                height={lh as number}
                rx={4}
                fill={c as string}
                opacity={0.9}
              />
              <rect
                x={(lx as number) - (lw as number) / 2}
                y={ly as number}
                width={lw as number}
                height={8}
                fill="#1A1E28"
                opacity={0.5}
              />
            </g>
          );
        })}
        {/* 屋上に出てきた住民。全員の顔が見える明るさにする */}
        <Okujo x={1636} y={1002} h={470} kind="rojin" turn={0.4} />
        <Okujo x={700} y={988} h={300} kind="kid" turn={0.8} />
        <Okujo x={792} y={978} h={498} kind="roosari" turn={0.2} />
        <Okujo x={1028} y={994} h={524} kind="pajama" armUp={lift} lit={lift} />
        {/* 掲げた携帯の明かりが屋上に落ちる */}
        {lift > 0.3 && (
          <ellipse cx={1120} cy={980} rx={190} ry={54} fill={D31.phoneGlow} opacity={0.1 * lift} />
        )}
        <Fuda x={322} y={940} text="テヘラン 屋上" t={easeOut(seg(f, 18, 36))} size={26} tone={WP.alert} />
      </Cam>
      <YearTag year="二〇二六" place="テヘラン" f={f} />
    </>
  );
};

// ===================================================================
// #32 山「最高指導者の公邸が攻撃され、36年以上頂点にいたアリー・ハメネイ師が死亡。」
// ===================================================================
// 公邸の内部。崩れた部屋の床の寄り。人は出さず、残された物で死を言う。
// 顔を描かない。遺影を出さない。×印で死を表さない。
const D32 = {
  air: "#2A2219", // 埃の立った室内の空気
  shaft: "#F0DFB4", // 斜めに差し込む光
  carpet: "#6E1F20", // ペルシア絨毯の地 (茜)
  carpetDark: "#4A1314",
  carpetNavy: "#1C2E52", // 中央のメダリオン
  carpetCream: "#D8C79A",
  carpetGreen: "#2C5240",
  carpetBack: "#C4B795", // めくれて見える裏 (緯糸)
  turban: "#15161A", // 黒いターバン
  turbanSheen: "#3A3C46",
  glassRim: "#2A2622", // 眼鏡の縁
  lens: "#AEC6CE",
  plaster: "#E6E0CE", // 漆喰の粉
  plasterShade: "#B7B09A",
  rubble: "#8E887A",
  wood: "#5A3A1E", // 倒れた書見台
  woodLit: "#8A5E34",
  page: "#F0E8D2",
  pageLine: "#56493A",
  cable: "#1E1C1A", // 天井から下がる配線
  cableCopper: "#B5742C",
  bead: "#2E2A3A", // 切れた数珠 (この枚で自分から足した1つ)
  beadLit: "#6A6480",
  line: "#1A1612",
};

const S32: SekaiArt = ({ f }) => {
  const uid = "d32";
  // 事件: 埃の中を光の筋が横切り、眼鏡のレンズが一度光る
  const glint = Math.max(0, 1 - Math.abs(f - 46) / 6) ** 2;
  const sweep = easeInOut(seg(f, 18, 60));
  const swing = Math.sin(f / 15);
  // 絨毯の繰り返し模様 (ボテ) の格子
  const boteh: [number, number][] = [];
  for (let gx = -840; gx <= 840; gx += 240) {
    for (let gy = -420; gy <= 420; gy += 210) {
      if (Math.abs(gx) < 300 && Math.abs(gy) < 190) continue; // 中央のメダリオンの所は空ける
      boteh.push([gx, gy]);
    }
  }
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-sweep`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0%" stopColor={D32.shaft} stopOpacity={0} />
          <stop offset="50%" stopColor={D32.shaft} stopOpacity={0.3} />
          <stop offset="100%" stopColor={D32.shaft} stopOpacity={0} />
        </linearGradient>
      </defs>
      <WarmStage f={f} uid={uid} src={[1500, -80]} srcR={960} glow={D32.shaft} bg={D32.air} motes={54} vig={0.92}>
        <Cam f={f} from={[0, 0, 1.0]} to={[-24, -18, 1.08]} start={0} end={80}>
          {/* 床のペルシア絨毯。ほぼ真上から見た寄り */}
          <g transform="translate(940 690) rotate(-5)">
            <rect x={-980} y={-540} width={1960} height={1080} fill={D32.carpet} />
            {/* 縁の帯を入れ子に */}
            {[
              [40, D32.carpetNavy],
              [74, D32.carpetCream],
              [96, D32.carpetDark],
              [152, D32.carpetGreen],
            ].map(([inset, c], i) => (
              <rect
                key={i}
                x={-980 + (inset as number)}
                y={-540 + (inset as number)}
                width={1960 - (inset as number) * 2}
                height={1080 - (inset as number) * 2}
                fill="none"
                stroke={c as string}
                strokeWidth={i === 3 ? 10 : 20}
              />
            ))}
            {/* 縁の帯に並ぶ小花 */}
            {Array.from({ length: 22 }, (_, i) => (
              <g key={i}>
                <circle cx={-900 + i * 82} cy={-466} r={7} fill={D32.carpetCream} opacity={0.8} />
                <circle cx={-900 + i * 82} cy={466} r={7} fill={D32.carpetCream} opacity={0.8} />
              </g>
            ))}
            {/* 繰り返しのボテ (ペイズリー) */}
            {boteh.map(([bx, by], i) => (
              <g key={i} transform={`translate(${bx} ${by})`} opacity={0.72}>
                <path
                  d="M0 -34 Q26 -22 26 6 Q26 32 0 34 Q-26 32 -26 6 Q-26 -22 -8 -30 Q6 -44 0 -58"
                  fill={i % 3 === 0 ? D32.carpetNavy : D32.carpetCream}
                  stroke={D32.carpetDark}
                  strokeWidth={2.6}
                />
                <circle cx={0} cy={2} r={8} fill={D32.carpetGreen} />
              </g>
            ))}
            {/* 中央のメダリオン */}
            <path
              d="M0 -210 L150 -96 L196 0 L150 96 L0 210 L-150 96 L-196 0 L-150 -96 Z"
              fill={D32.carpetNavy}
              stroke={D32.carpetCream}
              strokeWidth={9}
            />
            <path
              d="M0 -150 L108 -70 L140 0 L108 70 L0 150 L-108 70 L-140 0 L-108 -70 Z"
              fill={D32.carpetDark}
              stroke={D32.carpetCream}
              strokeWidth={5}
            />
            <circle cx={0} cy={0} r={56} fill={D32.carpetGreen} stroke={D32.carpetCream} strokeWidth={5} />
            {Array.from({ length: 8 }, (_, i) => (
              <ellipse
                key={i}
                cx={0}
                cy={-86}
                rx={13}
                ry={28}
                fill={D32.carpetCream}
                opacity={0.8}
                transform={`rotate(${i * 45})`}
              />
            ))}
            {/* 四隅の隅飾り (スパンドレル) */}
            {[
              [-1, -1],
              [1, -1],
              [-1, 1],
              [1, 1],
            ].map(([sx, sy], i) => (
              <path
                key={i}
                d="M0 0 Q210 14 230 180 Q120 120 0 0 Z"
                fill={D32.carpetNavy}
                opacity={0.85}
                transform={`translate(${(sx as number) * 800} ${(sy as number) * 360}) scale(${-(sx as number)} ${-(
                  sy as number
                )})`}
              />
            ))}
          </g>
          {/* めくれた絨毯の角。裏の緯糸が見える */}
          <g>
            <path d="M60 1080 L60 790 Q230 742 372 846 Q250 980 196 1080 Z" fill={D32.carpetBack} stroke={D32.line} strokeWidth={4} />
            <path d="M60 790 Q230 742 372 846" fill="none" stroke="#9A8E6E" strokeWidth={9} />
            {Array.from({ length: 12 }, (_, i) => (
              <line
                key={i}
                x1={72 + i * 24}
                y1={802 + i * 6}
                x2={96 + i * 24}
                y2={1060 - i * 10}
                stroke="#A79A78"
                strokeWidth={3}
                opacity={0.6}
              />
            ))}
            {/* 房 */}
            {Array.from({ length: 9 }, (_, i) => (
              <line
                key={i}
                x1={74 + i * 34}
                y1={796 + i * 12}
                x2={58 + i * 34}
                y2={752 + i * 12}
                stroke={D32.carpetCream}
                strokeWidth={4}
              />
            ))}
            <path d="M60 790 Q220 760 360 850 L372 846 Q230 742 60 790 Z" fill={D32.line} opacity={0.4} />
          </g>
          {/* 天井から下がる配線 */}
          {[
            [540, 0.9],
            [700, 1.3],
            [1480, 0.7],
          ].map(([cx, k], i) => (
            <path
              key={i}
              d={`M${cx} -40 Q${(cx as number) + 60 + swing * 18 * (k as number)} 180 ${
                (cx as number) + 20 + swing * 30 * (k as number)
              } 400`}
              fill="none"
              stroke={D32.cable}
              strokeWidth={9}
              strokeLinecap="round"
            />
          ))}
          <g transform={`translate(${1500 + swing * 20} 404)`}>
            <rect x={-28} y={0} width={56} height={44} rx={5} fill="#2C2A26" stroke={D32.line} strokeWidth={3} />
            <path d="M-14 44 Q-18 86 -4 118" fill="none" stroke={D32.cableCopper} strokeWidth={4} />
            <path d="M12 44 Q20 80 8 110" fill="none" stroke={D32.cableCopper} strokeWidth={4} />
          </g>
          {/* 漆喰の粉と瓦礫 */}
          <g>
            <path
              d="M620 980 Q760 900 980 926 Q1180 950 1300 1030 Q1040 1070 820 1056 Q680 1046 620 980 Z"
              fill={D32.plaster}
              opacity={0.82}
            />
            <path
              d="M700 992 Q840 936 1000 952 Q1140 966 1230 1018 Q1020 1040 850 1030 Z"
              fill="#FFFFFF"
              opacity={0.3}
            />
            {Array.from({ length: 34 }, (_, i) => (
              <circle
                key={i}
                cx={430 + ((i * 271) % 1180)}
                cy={790 + ((i * 163) % 270)}
                r={i % 4 === 0 ? 6 : 3}
                fill={D32.plaster}
                opacity={0.7}
              />
            ))}
            {[
              [520, 884, 70, 44, -12],
              [1320, 912, 92, 52, 8],
              [1140, 1012, 60, 36, 22],
            ].map(([rx, ry, rw, rh, rr], i) => (
              <g key={i} transform={`rotate(${rr} ${rx} ${ry})`}>
                <rect x={rx} y={ry} width={rw} height={rh} rx={4} fill={D32.rubble} stroke={D32.line} strokeWidth={3} />
                <rect x={rx} y={ry} width={rw} height={10} fill={D32.plaster} opacity={0.8} />
              </g>
            ))}
          </g>
          {/* 倒れた書見台 (ラフレ) と開いた書物 */}
          <g transform="translate(1310 640) rotate(102)">
            <rect x={-150} y={-14} width={300} height={22} rx={6} fill={D32.wood} stroke={D32.line} strokeWidth={3.4} />
            <rect x={-150} y={-14} width={300} height={7} fill={D32.woodLit} opacity={0.8} />
            <rect x={-150} y={64} width={300} height={22} rx={6} fill={D32.wood} stroke={D32.line} strokeWidth={3.4} />
            <path d="M-120 -4 L104 76 M-104 76 L120 -4" stroke={D32.wood} strokeWidth={20} />
            <path d="M-120 -4 L104 76 M-104 76 L120 -4" stroke={D32.line} strokeWidth={3} opacity={0.5} />
          </g>
          <g transform="translate(1030 700) rotate(-9)">
            <path d="M-210 0 Q-104 -36 0 -16 Q104 -36 210 0 Q104 46 0 30 Q-104 46 -210 0 Z" fill={D32.page} stroke={D32.line} strokeWidth={4} />
            <path d="M0 -16 L0 30" stroke={D32.pageLine} strokeWidth={4} />
            {Array.from({ length: 7 }, (_, i) => (
              <g key={i}>
                <line x1={-186 + i * 4} y1={-6 + i * 5} x2={-26} y2={-10 + i * 5} stroke={D32.pageLine} strokeWidth={2.6} opacity={0.65} />
                <line x1={26} y1={-10 + i * 5} x2={186 - i * 4} y2={-6 + i * 5} stroke={D32.pageLine} strokeWidth={2.6} opacity={0.65} />
              </g>
            ))}
            {/* 粉が積もっている */}
            <path d="M-150 -14 Q-60 -28 20 -18 Q-60 -4 -150 -14 Z" fill={D32.plaster} opacity={0.85} />
          </g>
          {/* 切れた数珠 (タスビーフ) ── この枚で自分から足した1つ */}
          <g>
            <path d="M700 772 Q790 744 876 782" fill="none" stroke="#6E6450" strokeWidth={3} />
            {Array.from({ length: 11 }, (_, i) => {
              const t = i / 10;
              const bx = (1 - t) * (1 - t) * 700 + 2 * (1 - t) * t * 790 + t * t * 876;
              const by = (1 - t) * (1 - t) * 772 + 2 * (1 - t) * t * 744 + t * t * 782;
              return (
                <g key={i}>
                  <circle cx={bx} cy={by} r={10} fill={D32.bead} stroke={D32.line} strokeWidth={2.4} />
                  <circle cx={bx - 3} cy={by - 3} r={3.4} fill={D32.beadLit} opacity={0.8} />
                </g>
              );
            })}
            {[
              [930, 820],
              [966, 790],
              [1010, 836],
            ].map(([bx, by], i) => (
              <g key={i}>
                <circle cx={bx} cy={by} r={10} fill={D32.bead} stroke={D32.line} strokeWidth={2.4} />
                <circle cx={(bx as number) - 3} cy={(by as number) - 3} r={3.4} fill={D32.beadLit} opacity={0.8} />
              </g>
            ))}
          </g>
          {/* 床に落ちた黒いターバン。巻いた布の形のまま解けかけている */}
          <g transform="translate(764 540) rotate(-8)">
            <ellipse cx={0} cy={0} rx={176} ry={122} fill={D32.turban} stroke={D32.line} strokeWidth={4} />
            {[0, 1, 2, 3, 4].map((i) => (
              <ellipse
                key={i}
                cx={i * 4 - 8}
                cy={-i * 7}
                rx={164 - i * 28}
                ry={110 - i * 20}
                fill="none"
                stroke={D32.turbanSheen}
                strokeWidth={5}
                opacity={0.6}
              />
            ))}
            <ellipse cx={-6} cy={-18} rx={78} ry={48} fill="#0C0D10" />
            <path d="M-120 -56 Q-40 -96 60 -74" fill="none" stroke={D32.turbanSheen} strokeWidth={7} opacity={0.5} />
            {/* 解けた端が床へ伸びる */}
            <path
              d="M164 42 Q290 86 352 182 Q392 244 372 300"
              fill="none"
              stroke={D32.turban}
              strokeWidth={46}
              strokeLinecap="round"
            />
            <path
              d="M164 42 Q290 86 352 182 Q392 244 372 300"
              fill="none"
              stroke={D32.turbanSheen}
              strokeWidth={5}
              opacity={0.45}
            />
            <path d="M-170 10 Q-250 56 -286 128" fill="none" stroke={D32.turban} strokeWidth={34} strokeLinecap="round" />
            {/* 粉が載っている */}
            <path d="M-80 -92 Q0 -116 92 -94 Q0 -78 -80 -92 Z" fill={D32.plaster} opacity={0.7} />
          </g>
          {/* 割れた眼鏡。黒いターバンとこの2つでハメネイ師だと分かる */}
          <g transform="translate(1178 462) rotate(13)">
            <path d="M-150 -6 L-104 -22" stroke={D32.glassRim} strokeWidth={8} strokeLinecap="round" />
            <path d="M150 10 Q196 2 214 -22" fill="none" stroke={D32.glassRim} strokeWidth={8} strokeLinecap="round" />
            <rect x={-104} y={-34} width={94} height={70} rx={22} fill={D32.lens} opacity={0.5} stroke={D32.glassRim} strokeWidth={8} />
            <rect x={14} y={-28} width={94} height={70} rx={22} fill={D32.lens} opacity={0.34} stroke={D32.glassRim} strokeWidth={8} />
            <path d="M-10 -22 Q2 -14 14 -18" fill="none" stroke={D32.glassRim} strokeWidth={7} />
            {/* 左のレンズが割れている */}
            <g stroke="#F4F6F6" strokeWidth={3} opacity={0.9}>
              <path d="M-96 -16 L-56 4 L-20 -26" fill="none" />
              <path d="M-56 4 L-62 32" fill="none" />
              <path d="M-56 4 L-98 22" fill="none" />
              <path d="M-56 4 L-34 -30" fill="none" />
            </g>
            {/* 事件: レンズが一度光る */}
            {glint > 0 && (
              <>
                <rect x={14} y={-28} width={94} height={70} rx={22} fill="#FFFFFF" opacity={0.78 * glint} />
                <path d="M20 40 L104 -24" stroke="#FFFFFF" strokeWidth={10} opacity={glint} strokeLinecap="round" />
              </>
            )}
          </g>
          {/* 埃の中を横切る光の筋 */}
          <g opacity={0.9}>
            <path
              d={`M${-400 + sweep * 900} -60 L${40 + sweep * 900} -60 L${900 + sweep * 900} 1140 L${
                400 + sweep * 900
              } 1140 Z`}
              fill={`url(#${uid}-sweep)`}
            />
          </g>
          <Fuda x={330} y={176} text="最高指導者公邸" t={easeOut(seg(f, 22, 40))} size={28} tone={WP.alert} />
        </Cam>
      </WarmStage>
      <YearTag year="二〇二六" place="テヘラン" f={f} />
    </>
  );
};

// ===================================================================
// #33 並「イランの暦では、断食月ラマダンの10日目でした。」
// ===================================================================
// 食卓の寄り。断食明けの食事 (イフタール) が手つかずのまま。
// 事件: 湯気が消えていく。誰も手をつけていないことを湯気で言う。
const D33 = {
  wall: "#3B3328", // 日が落ちた室内の壁
  wallHi: "#564B3A",
  niche: "#2A2419",
  sky: "#17264A", // 窓の外の空 (日没直後)
  skyLow: "#6E5A52",
  moon: "#F2E8CE", // 上弦前の細い月
  frame: "#4E3A24", // 窓枠
  glassDim: "#24354F",
  sofreh: "#E4DCC6", // 敷かれたソフレ (食卓布)
  sofrehShade: "#BFB69C",
  sofrehRed: "#9E3A33", // 織り出された縞
  sofrehGreen: "#2F6248",
  rug: "#5E2A28", // ソフレの下の絨毯
  plate: "#CFD2CB",
  plateRim: "#2E5C78",
  date: "#4E2A18", // ナツメヤシ (デーツ)
  dateLit: "#8A5230",
  bread: "#C79A5E", // サンギャク (平たいパン)
  breadDark: "#8E6232",
  breadChar: "#5E4020", // 石の跡
  bowl: "#DCD6C6",
  soup: "#9E5A28",
  jug: "#A6C2CA", // ガラスの水差し
  jugWater: "#6E9AA8",
  paper: "#EDE4CC", // 暦の紙
  inkGreen: "#1E6B4A",
  inkRed: "#B5322A",
  phone: "#20242C",
  steam: "#E8E2D2",
  line: "#1C1710",
};

const S33: SekaiArt = ({ f }) => {
  const uid = "d33";
  // 事件: 湯気が消えていく
  const steam = Math.max(0, 1 - easeInOut(seg(f, 10, 54)));
  const flick = 0.9 + 0.1 * Math.sin(f / 7);
  // サンギャクの表面に残る石の跡
  const stones: [number, number, number][] = [];
  for (let i = 0; i < 26; i++) {
    const a = i * 2.39996;
    const r = Math.sqrt((i + 0.6) / 26);
    stones.push([Math.cos(a) * r * 232, Math.sin(a) * r * 102, 7 + ((i * 5) % 7)]);
  }
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D33.niche} />
          <stop offset="70%" stopColor={D33.wall} />
          <stop offset="100%" stopColor={D33.wallHi} />
        </linearGradient>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D33.sky} />
          <stop offset="78%" stopColor="#3A4463" />
          <stop offset="100%" stopColor={D33.skyLow} />
        </linearGradient>
        <linearGradient id={`${uid}-cloth`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D33.sofrehShade} />
          <stop offset="34%" stopColor={D33.sofreh} />
          <stop offset="100%" stopColor="#D2C9AE" />
        </linearGradient>
        <radialGradient id={`${uid}-lamp`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE7B4" stopOpacity={0.34} />
          <stop offset="100%" stopColor="#FFE7B4" stopOpacity={0} />
        </radialGradient>
      </defs>
      <Cam f={f} from={[0, -20, 1.04]} to={[18, 8, 1.0]} start={0} end={80}>
        {/* 壁 */}
        <rect x={-200} y={-200} width={W + 400} height={740} fill={`url(#${uid}-wall)`} />
        {/* 壁の飾り壁龕 (ニッチ) */}
        {[220, 1000].map((nx, i) => (
          <path
            key={i}
            d={`M${nx} 460 L${nx} 180 Q${nx + 62} 110 ${nx + 124} 180 L${nx + 124} 460 Z`}
            fill={D33.niche}
            stroke="#6A5B45"
            strokeWidth={5}
          />
        ))}
        {/* 窓。外に上弦前の細い月 */}
        <g>
          <rect x={1330} y={70} width={430} height={372} fill={`url(#${uid}-sky)`} />
          <rect x={1330} y={70} width={430} height={372} fill="none" stroke={D33.frame} strokeWidth={22} />
          <line x1={1545} y1={70} x2={1545} y2={442} stroke={D33.frame} strokeWidth={14} />
          <line x1={1330} y1={256} x2={1760} y2={256} stroke={D33.frame} strokeWidth={14} />
          {/* 細い月。満月でも半月でもない */}
          <g transform="translate(1448 168)">
            <path d="M0 -58 A58 58 0 1 0 0 58 A80 80 0 0 1 0 -58 Z" fill={D33.moon} opacity={0.95} />
            <circle cx={-6} cy={0} r={74} fill={D33.moon} opacity={0.08} />
          </g>
          {[
            [1636, 132],
            [1700, 200],
            [1600, 330],
            [1684, 362],
          ].map(([sx, sy], i) => (
            <circle key={i} cx={sx} cy={sy} r={2.4} fill={WP.star} opacity={0.8} />
          ))}
        </g>
        {/* 壁に貼った暦。月の形で日を数え、10日目に朱の丸 */}
        <g transform="translate(406 300) rotate(-2)">
          <rect x={-168} y={-150} width={336} height={300} rx={5} fill={D33.paper} stroke={D33.line} strokeWidth={4} />
          <rect x={-168} y={-150} width={336} height={52} fill={D33.inkGreen} opacity={0.88} />
          <text x={0} y={-112} fontFamily={SEKAI_SERIF} fontSize={30} fill={D33.paper} textAnchor="middle">
            ラマダーン
          </text>
          {Array.from({ length: 15 }, (_, i) => {
            const cx = -132 + (i % 5) * 66;
            const cy = -54 + Math.floor(i / 5) * 76;
            const day = i + 1;
            const full = Math.min(1, day / 15);
            return (
              <g key={i}>
                {/* 日ごとに月の形を描いてある */}
                <circle cx={cx} cy={cy} r={21} fill="#D8CDAE" stroke={D33.inkGreen} strokeWidth={2.4} />
                <path
                  d={`M${cx} ${cy - 21} A21 21 0 1 0 ${cx} ${cy + 21} A${21 + (1 - full) * 70} ${21} 0 0 ${
                    full > 0.5 ? 0 : 1
                  } ${cx} ${cy - 21} Z`}
                  fill={D33.inkGreen}
                  opacity={0.85}
                />
                <text
                  x={cx}
                  y={cy + 40}
                  fontFamily={SEKAI_FONT}
                  fontSize={16}
                  fill={D33.line}
                  textAnchor="middle"
                  opacity={0.8}
                >
                  {day}
                </text>
              </g>
            );
          })}
          {/* 10日目 */}
          <circle
            cx={-132 + 4 * 66}
            cy={-54 + 76}
            r={30}
            fill="none"
            stroke={D33.inkRed}
            strokeWidth={6}
            opacity={easeOut(seg(f, 20, 42))}
          />
          <text
            x={-132 + 4 * 66}
            y={-54 + 76 + 70}
            fontFamily={SEKAI_SERIF}
            fontSize={24}
            fontWeight={700}
            fill={D33.inkRed}
            textAnchor="middle"
            opacity={easeOut(seg(f, 26, 46))}
          >
            十日目
          </text>
        </g>
        {/* 床の絨毯 */}
        <rect x={-200} y={430} width={W + 400} height={700} fill={D33.rug} />
        {Array.from({ length: 9 }, (_, i) => (
          <path
            key={i}
            d={`M${-120 + i * 240} 1120 L${-40 + i * 240} 470 L${60 + i * 240} 470 L${120 + i * 240} 1120 Z`}
            fill="#4A1F1E"
            opacity={0.5}
          />
        ))}
        {/* 敷かれたソフレ (食卓布) */}
        <path d="M300 486 L1618 486 L1920 1120 L-40 1120 Z" fill={`url(#${uid}-cloth)`} stroke={D33.line} strokeWidth={5} />
        {/* 織り出された縞 */}
        {[
          [508, D33.sofrehRed, 12],
          [536, D33.sofrehGreen, 7],
          [1004, D33.sofrehRed, 10],
          [1040, D33.sofrehGreen, 6],
        ].map(([sy, c, sw], i) => {
          const t = ((sy as number) - 486) / 634;
          const xl = 300 - t * 340;
          const xr = 1618 + t * 302;
          return <line key={i} x1={xl} y1={sy as number} x2={xr} y2={sy as number} stroke={c as string} strokeWidth={sw as number} opacity={0.75} />;
        })}
        {/* 卓上の明かり */}
        <ellipse cx={940} cy={760} rx={760} ry={330} fill={`url(#${uid}-lamp)`} opacity={flick} />
        {/* ナツメヤシ (デーツ) の皿 */}
        <g transform="translate(486 648)">
          <ellipse cx={0} cy={14} rx={154} ry={62} fill={D33.line} opacity={0.3} />
          <ellipse cx={0} cy={0} rx={150} ry={60} fill={D33.plate} stroke={D33.line} strokeWidth={4} />
          <ellipse cx={0} cy={-4} rx={116} ry={44} fill="none" stroke={D33.plateRim} strokeWidth={5} opacity={0.8} />
          {[
            [-72, -8, -18],
            [-30, 6, 24],
            [12, -12, -8],
            [58, 4, 32],
            [-48, 22, 10],
            [26, 24, -24],
            [86, -14, 14],
            [-10, -24, 4],
          ].map(([dx, dy, dr], i) => (
            <g key={i} transform={`translate(${dx} ${dy}) rotate(${dr})`}>
              <ellipse cx={0} cy={0} rx={30} ry={15} fill={D33.date} stroke={D33.line} strokeWidth={2.6} />
              <ellipse cx={-6} cy={-4} rx={16} ry={6} fill={D33.dateLit} opacity={0.65} />
            </g>
          ))}
        </g>
        {/* 平たいパン (サンギャク)。表面に石の跡が残る */}
        <g transform="translate(948 846) rotate(-3)">
          <ellipse cx={0} cy={22} rx={272} ry={118} fill={D33.line} opacity={0.3} />
          <ellipse cx={0} cy={0} rx={268} ry={114} fill={D33.bread} stroke={D33.breadDark} strokeWidth={6} />
          <ellipse cx={-20} cy={-16} rx={222} ry={80} fill="#D8AE74" opacity={0.6} />
          {stones.map(([sx, sy, sr], i) => (
            <ellipse key={i} cx={sx} cy={sy} rx={sr} ry={sr * 0.72} fill={D33.breadChar} opacity={0.6} />
          ))}
          <path d="M-240 20 Q-120 56 0 50 Q130 44 246 12" fill="none" stroke={D33.breadDark} strokeWidth={5} opacity={0.6} />
          <path d="M-200 -52 Q-80 -74 60 -62" fill="none" stroke={D33.breadDark} strokeWidth={4} opacity={0.5} />
        </g>
        {/* スープの椀。湯気が消えていく */}
        <g transform="translate(1356 682)">
          <ellipse cx={0} cy={56} rx={118} ry={44} fill={D33.line} opacity={0.3} />
          <path d="M-112 -16 Q-96 62 0 70 Q96 62 112 -16 Z" fill={D33.bowl} stroke={D33.line} strokeWidth={4} />
          <ellipse cx={0} cy={-18} rx={112} ry={42} fill={D33.soup} stroke={D33.line} strokeWidth={4} />
          <ellipse cx={-22} cy={-24} rx={62} ry={20} fill="#C4762E" opacity={0.65} />
          <ellipse cx={0} cy={-18} rx={112} ry={42} fill="none" stroke={D33.plateRim} strokeWidth={5} opacity={0.5} />
          {[0, 1, 2].map((i) => {
            const t = ((f * 1.6 + i * 34) % 100) / 100;
            return (
              <path
                key={i}
                d={`M${-44 + i * 42} -40 q${18 - i * 12} -46 ${-6 + i * 8} -92 q${-14 + i * 10} -40 ${4} -78`}
                fill="none"
                stroke={D33.steam}
                strokeWidth={9}
                strokeLinecap="round"
                opacity={steam * 0.42 * (1 - t) * flick}
                transform={`translate(0 ${-t * 34})`}
              />
            );
          })}
        </g>
        {/* ガラスの水差し */}
        <g transform="translate(1618 560)">
          <path d="M-54 -116 L-48 -92 Q-66 -40 -62 36 Q-60 92 0 96 Q60 92 62 36 Q66 -40 48 -92 L54 -116 Z" fill={D33.jug} opacity={0.55} stroke={D33.line} strokeWidth={4} />
          <path d="M-58 -6 Q-58 86 0 90 Q58 86 58 -6 Z" fill={D33.jugWater} opacity={0.72} />
          <path d="M-44 -100 L44 -100" stroke={D33.line} strokeWidth={3} opacity={0.5} />
          <path d="M54 -104 Q104 -80 98 -14 Q94 32 58 40" fill="none" stroke={D33.jug} strokeWidth={11} opacity={0.75} />
          <path d="M-34 -70 Q-44 -10 -38 56" fill="none" stroke="#E8F2F4" strokeWidth={6} opacity={0.5} />
        </g>
        {/* 手つかずのスプーン2本 */}
        {[
          [664, 930, -14],
          [736, 952, -9],
        ].map(([sx, sy, sr], i) => (
          <g key={i} transform={`translate(${sx} ${sy}) rotate(${sr})`}>
            <ellipse cx={0} cy={0} rx={26} ry={17} fill="#C8CBC6" stroke={D33.line} strokeWidth={3} />
            <rect x={22} y={-6} width={112} height={11} rx={5} fill="#C8CBC6" stroke={D33.line} strokeWidth={3} />
          </g>
        ))}
        {/* 伏せて置かれた携帯 (この枚で自分から足した1つ)。誰も戻ってこない */}
        <g transform="translate(1180 1004) rotate(7)">
          <rect x={-66} y={-34} width={132} height={68} rx={9} fill={D33.phone} stroke={D33.line} strokeWidth={4} />
          <circle cx={-32} cy={-12} r={8} fill="#3A4048" />
          <circle cx={-32} cy={10} r={6} fill="#3A4048" />
          <rect x={-66} y={-34} width={132} height={10} rx={5} fill="#38404A" opacity={0.7} />
        </g>
        <Fuda x={330} y={560} text="イフタール 手つかず" t={easeOut(seg(f, 34, 52))} size={26} tone={D33.inkRed} />
      </Cam>
      <YearTag year="二〇二六" place="テヘラン" f={f} />
    </>
  );
};

// ===================================================================
// #34 図「3月。」
// ===================================================================
// #9 #15 #30 と同じ暦の型で続ける (4枚で1組)。
// その型を記者の机の上のモニタの中に入れて、手前に紙の暦と落ちる2月のページを置く。
const D34 = {
  room: "#161C26",
  roomHi: "#263243",
  desk: "#3A2E22", // 机の天板
  deskLit: "#5E4A34",
  deskEdge: "#20180F",
  bezel: "#1A1E24", // モニタの枠
  screen: "#0C1726", // 画面の奥 (暗い青)
  screenHi: "#1A3450",
  rule: "#2C4760",
  light: "#BFD8EC",
  paper: "#F2EDE1",
  paperShade: "#D6CDB6",
  paperBack: "#E0D6BC",
  grid: "#9A917C",
  inkRed: "#B5322A",
  inkGreen: "#1E6B4A",
  pen: "#1E2228",
  penClip: "#B8912E",
  line: "#1A1714",
};

const S34: SekaiArt = ({ f }) => {
  const uid = "d34";
  // 事件: 2月のページが破れて落ちきる
  const drop = easeInOut(seg(f, 8, 52));
  const py = -40 + drop * 1020;
  const pr = -6 + drop * 94;
  const px = 470 + drop * 120;
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-room`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D34.room} />
          <stop offset="100%" stopColor={D34.roomHi} />
        </linearGradient>
        <linearGradient id={`${uid}-screen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D34.screenHi} />
          <stop offset="100%" stopColor={D34.screen} />
        </linearGradient>
        <linearGradient id={`${uid}-desk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D34.deskLit} />
          <stop offset="100%" stopColor={D34.desk} />
        </linearGradient>
      </defs>
      <Cam f={f} from={[0, 0, 1.03]} to={[-14, -6, 1.0]} start={0} end={70}>
        <rect x={-200} y={-200} width={W + 400} height={1180} fill={`url(#${uid}-room)`} />
        {/* 奥の壁の罫 */}
        {[160, 300, 440].map((wy) => (
          <line key={wy} x1={-200} y1={wy} x2={W + 200} y2={wy} stroke={D34.rule} strokeWidth={2.4} opacity={0.3} />
        ))}
        {/* モニタ。この中が #9 #15 #30 と同じ暦の型 */}
        <g>
          <rect x={462} y={186} width={1004} height={530} rx={14} fill={D34.bezel} stroke={D34.line} strokeWidth={5} />
          <rect x={492} y={214} width={944} height={462} rx={5} fill={`url(#${uid}-screen)`} />
          <g transform="translate(378 0) scale(0.6)">
            <SekaiChrono
              f={f}
              at="2026"
              from="1988"
              month="3月"
              monthFrom="2月28日"
              y={740}
              rail={WP.steelDark}
              railLower={WP.steelDark}
              mark={WP.alert}
              label={WP.steelLit}
            />
          </g>
          {/* 画面の照り */}
          <path d="M492 214 L760 214 L560 676 L492 676 Z" fill={D34.light} opacity={0.05} />
          <rect x={492} y={214} width={944} height={462} rx={5} fill="none" stroke={D34.rule} strokeWidth={3} />
          {/* 台 */}
          <rect x={904} y={716} width={120} height={56} fill={D34.bezel} />
          <rect x={824} y={766} width={280} height={18} rx={8} fill={D34.bezel} stroke={D34.line} strokeWidth={4} />
        </g>
        {/* 机 */}
        <rect x={-200} y={784} width={W + 400} height={60} fill={`url(#${uid}-desk)`} />
        <rect x={-200} y={784} width={W + 400} height={10} fill={D34.deskLit} opacity={0.7} />
        <rect x={-200} y={844} width={W + 400} height={240} fill={D34.deskEdge} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={i}
            x1={-200 + i * 380}
            y1={784}
            x2={-260 + i * 380}
            y2={844}
            stroke={D34.desk}
            strokeWidth={3}
            opacity={0.5}
          />
        ))}
        {/* 立てた2026年3月の暦 */}
        <g transform="translate(1536 596) rotate(3)">
          <path d="M-196 190 L-150 230 L150 230 L196 190 Z" fill={D34.paperShade} stroke={D34.line} strokeWidth={4} />
          <rect x={-196} y={-220} width={392} height={412} rx={6} fill={D34.paper} stroke={D34.line} strokeWidth={5} />
          {/* 綴じの金具 */}
          {[-120, 0, 120].map((bx) => (
            <g key={bx}>
              <circle cx={bx} cy={-196} r={11} fill="none" stroke="#8E8778" strokeWidth={5} />
            </g>
          ))}
          <text x={-172} y={-140} fontFamily={SEKAI_SERIF} fontSize={74} fontWeight={700} fill={D34.line}>
            3
          </text>
          <text x={-86} y={-142} fontFamily={SEKAI_SERIF} fontSize={34} fill={D34.line}>
            月
          </text>
          <text x={176} y={-166} fontFamily={SEKAI_FONT} fontSize={22} fill={D34.grid} textAnchor="end">
            2026
          </text>
          {/* ペルシア暦の月名。3月20日の春分でエスファンドからファルヴァルディーンに替わる */}
          <text x={176} y={-134} fontFamily={SEKAI_FONT} fontSize={19} fill={D34.inkGreen} textAnchor="end">
            エスファンド 1404
          </text>
          <text x={176} y={-108} fontFamily={SEKAI_FONT} fontSize={19} fill={D34.inkGreen} textAnchor="end">
            ファルヴァルディーン 1405
          </text>
          <line x1={-180} y1={-92} x2={180} y2={-92} stroke={D34.grid} strokeWidth={3} />
          {/* 曜日の頭 */}
          {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
            <text
              key={d}
              x={-156 + i * 52}
              y={-62}
              fontFamily={SEKAI_FONT}
              fontSize={20}
              fill={i === 0 ? D34.inkRed : D34.grid}
              textAnchor="middle"
            >
              {d}
            </text>
          ))}
          {/* 2026年3月1日は日曜日 */}
          {Array.from({ length: 31 }, (_, i) => {
            const d = i + 1;
            const col = i % 7;
            const row = Math.floor(i / 7);
            const cx = -156 + col * 52;
            const cy = -22 + row * 48;
            return (
              <text
                key={d}
                x={cx}
                y={cy}
                fontFamily={SEKAI_FONT}
                fontSize={22}
                fill={col === 0 ? D34.inkRed : D34.line}
                textAnchor="middle"
                opacity={0.9}
              >
                {d}
              </text>
            );
          })}
          {/* 3月20日 = ノウルーズ (ペルシア暦の元日) に緑の印 */}
          <circle cx={-156 + 5 * 52} cy={-30 + 2 * 48} r={20} fill="none" stroke={D34.inkGreen} strokeWidth={5} opacity={easeOut(seg(f, 30, 50))} />
          {/* 破り取られた跡 (ここに2月があった) */}
          <path
            d="M-196 -220 Q-150 -206 -104 -218 Q-58 -204 -12 -216 Q34 -202 80 -214 Q126 -200 196 -216"
            fill="none"
            stroke={D34.paperShade}
            strokeWidth={7}
          />
        </g>
        {/* 事件: 前の月 (2月) のページが破れて落ちていく */}
        <g transform={`translate(${px} ${py}) rotate(${pr})`} opacity={drop < 1 ? 1 : 0.96}>
          <rect x={-150} y={-190} width={300} height={380} rx={5} fill={D34.paperBack} stroke={D34.line} strokeWidth={4} />
          <path
            d="M-150 -190 Q-112 -176 -74 -188 Q-36 -174 2 -186 Q40 -172 78 -184 Q116 -170 150 -186 L150 -190 Z"
            fill={D34.paperShade}
          />
          <text x={-124} y={-116} fontFamily={SEKAI_SERIF} fontSize={62} fontWeight={700} fill={D34.grid}>
            2
          </text>
          <text x={-56} y={-118} fontFamily={SEKAI_SERIF} fontSize={28} fill={D34.grid}>
            月
          </text>
          {Array.from({ length: 28 }, (_, i) => (
            <text
              key={i}
              x={-120 + (i % 7) * 40}
              y={-44 + Math.floor(i / 7) * 44}
              fontFamily={SEKAI_FONT}
              fontSize={18}
              fill={D34.grid}
              textAnchor="middle"
              opacity={0.6}
            >
              {i + 1}
            </text>
          ))}
          <line x1={-130} y1={-78} x2={130} y2={-78} stroke={D34.grid} strokeWidth={2.4} opacity={0.6} />
        </g>
        {/* 落ちきった紙が机の上で止まる */}
        {drop >= 1 && (
          <ellipse cx={px} cy={py + 150} rx={170} ry={26} fill={D34.line} opacity={0.3} />
        )}
        {/* ペン */}
        <g transform="translate(1004 806) rotate(-8)">
          <rect x={-130} y={-9} width={260} height={18} rx={9} fill={D34.pen} stroke={D34.line} strokeWidth={3} />
          <path d="M130 -9 L166 0 L130 9 Z" fill="#8E8778" stroke={D34.line} strokeWidth={2.6} />
          <rect x={-104} y={-12} width={9} height={24} rx={4} fill={D34.penClip} />
          <rect x={-130} y={-9} width={34} height={18} rx={9} fill="#2E353E" />
        </g>
        <Fuda x={330} y={880} text="二〇二六年 三月" t={easeOut(seg(f, 24, 44))} size={30} tone={WP.alert} />
      </Cam>
      <YearTag year="二〇二六" place="三月" f={f} />
    </>
  );
};

// ===================================================================
// #35 並「後継に選ばれたのは、息子のモジタバ師です。」
// #36 図「本人もこの攻撃で負傷し、妻を亡くしたと報じられています。」
// ===================================================================
// 系図は紙の上の図にする。人は記者の手だけ。顔は描かない。
// 世襲は「父の枠と子の枠に同じ黒いターバンの絵が貼られている」ことで言う。
// #36 は同じ紙を使う (second で切り替える)。
const D35 = {
  desk: "#2E241A", // 机の天板 (紙の外に見える)
  deskLit: "#4A3A28",
  paper: "#EFE7D2", // 手書きの系図の紙
  paperShade: "#D8CEB4",
  paperFold: "#C4B99C", // 紙の折り目
  pencil: "#4A4238", // 鉛筆の線
  pencilDark: "#262220",
  ink: "#1F2B4A", // ペンのインク (青黒)
  inkBled: "#3E4E72", // 滲んだインク
  red: "#B5322A",
  turban: "#15161A", // 貼られた黒いターバンの小さな絵
  turbanSheen: "#4A4C58",
  tape: "#E6DFC4", // セロハンテープ
  tapeEdge: "#C8BF9E",
  ruler: "#BFD6C8", // 定規 (半透明の緑)
  rulerEdge: "#7EA294",
  rulerMark: "#2E4A40",
  woodPencil: "#C98A3C", // 鉛筆の木地
  woodPencilDark: "#8A5A20",
  graphite: "#3A3A40",
  eraser: "#E8E2D0",
  shirt: "#DCE4EC", // 記者のシャツの袖 (現代の日本)
  shirtShade: "#AEB9C6",
  cuffBtn: "#8E99A6",
  skin: WP.skin,
  skinShade: WP.skinShade,
  band: "#F0EDE4", // 絆創膏
  bandPad: "#D6CDB0",
  line: "#1A1714",
};

// 貼られた黒いターバンの小さな絵。父の枠と子の枠に同じ物を置く
const TurbanSticker: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({
  x,
  y,
  s = 1,
  t = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={t}>
    {/* セロハンテープ */}
    <rect x={-58} y={-52} width={44} height={22} rx={2} fill={D35.tape} stroke={D35.tapeEdge} strokeWidth={2} opacity={0.85} transform="rotate(-18 -36 -41)" />
    <rect x={14} y={-52} width={44} height={22} rx={2} fill={D35.tape} stroke={D35.tapeEdge} strokeWidth={2} opacity={0.85} transform="rotate(16 36 -41)" />
    {/* 小さな紙 */}
    <rect x={-56} y={-44} width={112} height={88} rx={3} fill="#F6F1E2" stroke={D35.line} strokeWidth={2.6} />
    {/* 黒いターバン (サイイドの印)。巻いた布を正面から */}
    <path d="M-40 18 Q-44 -22 0 -28 Q44 -22 40 18 Z" fill={D35.turban} stroke={D35.line} strokeWidth={2.6} />
    <path d="M-38 4 Q0 -12 38 4" fill="none" stroke={D35.turbanSheen} strokeWidth={3.4} />
    <path d="M-34 -8 Q0 -22 34 -8" fill="none" stroke={D35.turbanSheen} strokeWidth={3} />
    <ellipse cx={0} cy={22} rx={30} ry={11} fill="#D9A47A" stroke={D35.line} strokeWidth={2.4} />
    <path d="M-30 22 Q0 40 30 22" fill="#C9966C" />
    <text x={0} y={-32} fontFamily={SEKAI_FONT} fontSize={13} fill={D35.pencil} textAnchor="middle">
      黒ターバン
    </text>
  </g>
);

const Keizu: React.FC<{ f: number; uid: string; second?: boolean }> = ({ f, uid, second }) => {
  // #35 の事件: 子の枠に線が引かれたあと、鉛筆が止まる
  const draw = easeInOut(seg(f, 10, 44));
  const stop = easeOut(seg(f, 44, 58)); // 止まる (手の震えが消える)
  const jitter = (1 - stop) * Math.sin(f / 2.2) * 2.4;
  // #36 の事件: インクが紙に滲んで広がる
  const blot = second ? easeOut(seg(f, 14, 56)) : 0;
  const wifeX = second ? easeOut(seg(f, 6, 24)) : 0;
  const hurt = second ? easeOut(seg(f, 22, 40)) : 0;
  // 枠の位置
  const FA = { x: 620, y: 300, w: 320, h: 196 }; // 父 (ハメネイ師)
  const WB = { x: 1138, y: 306, w: 300, h: 180 }; // 妻
  const SN = { x: 700, y: 724, w: 348, h: 210 }; // 子 (モジタバ師)
  const lineTop = FA.y + FA.h;
  const lineBtm = SN.y;
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-desk`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={D35.deskLit} />
          <stop offset="100%" stopColor={D35.desk} />
        </linearGradient>
        <linearGradient id={`${uid}-paper`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#F6F0DE" />
          <stop offset="60%" stopColor={D35.paper} />
          <stop offset="100%" stopColor={D35.paperShade} />
        </linearGradient>
        <radialGradient id={`${uid}-blot`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={D35.ink} stopOpacity={0.9} />
          <stop offset="58%" stopColor={D35.inkBled} stopOpacity={0.5} />
          <stop offset="100%" stopColor={D35.inkBled} stopOpacity={0} />
        </radialGradient>
      </defs>
      <Cam f={f} from={[0, 0, 1.0]} to={[10, -14, 1.06]} start={0} end={80}>
        {/* 机 */}
        <rect x={-200} y={-200} width={W + 400} height={1480} fill={`url(#${uid}-desk)`} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line key={i} x1={-200 + i * 300} y1={-200} x2={-80 + i * 300} y2={1120} stroke={D35.desk} strokeWidth={5} opacity={0.5} />
        ))}
        {/* 手書きの系図の紙 */}
        <g transform="translate(960 560) rotate(-1.6)">
          <rect x={-900} y={-540} width={1800} height={1080} fill={D35.line} opacity={0.26} transform="translate(14 18)" />
          <rect x={-900} y={-540} width={1800} height={1080} fill={`url(#${uid}-paper)`} stroke={D35.paperFold} strokeWidth={3} />
          {/* 紙の折り目。縦1本・横1本 */}
          <line x1={-900} y1={-6} x2={900} y2={-6} stroke={D35.paperFold} strokeWidth={4} opacity={0.75} />
          <line x1={-900} y1={2} x2={900} y2={2} stroke="#FFFFFF" strokeWidth={3} opacity={0.5} />
          <line x1={-16} y1={-540} x2={-16} y2={540} stroke={D35.paperFold} strokeWidth={4} opacity={0.6} />
          <line x1={-8} y1={-540} x2={-8} y2={540} stroke="#FFFFFF" strokeWidth={3} opacity={0.42} />
          {/* 薄い方眼 (手書きの下敷き) */}
          {Array.from({ length: 24 }, (_, i) => (
            <line key={i} x1={-900 + i * 78} y1={-540} x2={-900 + i * 78} y2={540} stroke={D35.paperFold} strokeWidth={1.4} opacity={0.22} />
          ))}
          {Array.from({ length: 14 }, (_, i) => (
            <line key={i} x1={-900} y1={-540 + i * 78} x2={900} y2={-540 + i * 78} stroke={D35.paperFold} strokeWidth={1.4} opacity={0.22} />
          ))}
        </g>
        {/* 見出し */}
        <text x={190} y={168} fontFamily={SEKAI_SERIF} fontSize={46} fontWeight={700} fill={D35.ink} opacity={0.9}>
          最高指導者 系図
        </text>
        <line x1={186} y1={186} x2={710} y2={190} stroke={D35.ink} strokeWidth={4} opacity={0.7} />
        {/* 父の枠 */}
        <g>
          <rect x={FA.x} y={FA.y} width={FA.w} height={FA.h} fill="none" stroke={D35.pencil} strokeWidth={6} />
          <rect x={FA.x + 7} y={FA.y + 7} width={FA.w - 14} height={FA.h - 14} fill="none" stroke={D35.pencil} strokeWidth={2} opacity={0.4} />
          <TurbanSticker x={FA.x + 86} y={FA.y + 100} s={0.92} />
          <text x={FA.x + 178} y={FA.y + 68} fontFamily={SEKAI_SERIF} fontSize={34} fill={D35.ink}>
            ハメネイ
          </text>
          <text x={FA.x + 178} y={FA.y + 112} fontFamily={SEKAI_FONT} fontSize={22} fill={D35.pencil}>
            一九八九〜
          </text>
          <text x={FA.x + 178} y={FA.y + 150} fontFamily={SEKAI_FONT} fontSize={22} fill={D35.pencil}>
            三六年
          </text>
          {/* 父の枠の×。鉛筆の2本線 */}
          <g opacity={0.95}>
            <path
              d={`M${FA.x + 16} ${FA.y + 14} L${FA.x + FA.w - 16} ${FA.y + FA.h - 14}`}
              stroke={D35.red}
              strokeWidth={9}
              strokeLinecap="round"
              strokeDasharray={420}
              strokeDashoffset={420 * (1 - easeOut(seg(f, second ? 0 : 2, second ? 4 : 18)))}
            />
            <path
              d={`M${FA.x + FA.w - 16} ${FA.y + 14} L${FA.x + 16} ${FA.y + FA.h - 14}`}
              stroke={D35.red}
              strokeWidth={9}
              strokeLinecap="round"
              strokeDasharray={420}
              strokeDashoffset={420 * (1 - easeOut(seg(f, second ? 2 : 8, second ? 6 : 24)))}
            />
          </g>
        </g>
        {/* 妻の枠 */}
        <g>
          <rect x={WB.x} y={WB.y} width={WB.w} height={WB.h} fill="none" stroke={D35.pencil} strokeWidth={5} />
          <text x={WB.x + 26} y={WB.y + 70} fontFamily={SEKAI_SERIF} fontSize={32} fill={D35.ink}>
            妻
          </text>
          <text x={WB.x + 26} y={WB.y + 124} fontFamily={SEKAI_FONT} fontSize={21} fill={D35.pencil}>
            公邸に同席
          </text>
          {/* 婚姻の二重線 */}
          <line x1={FA.x + FA.w} y1={FA.y + 84} x2={WB.x} y2={WB.y + 84} stroke={D35.pencil} strokeWidth={5} />
          <line x1={FA.x + FA.w} y1={FA.y + 100} x2={WB.x} y2={WB.y + 100} stroke={D35.pencil} strokeWidth={5} />
          {/* #36 で増える×印 */}
          {wifeX > 0 && (
            <g>
              <path
                d={`M${WB.x + 16} ${WB.y + 14} L${WB.x + WB.w - 16} ${WB.y + WB.h - 14}`}
                stroke={D35.red}
                strokeWidth={9}
                strokeLinecap="round"
                strokeDasharray={380}
                strokeDashoffset={380 * (1 - wifeX)}
              />
              <path
                d={`M${WB.x + WB.w - 16} ${WB.y + 14} L${WB.x + 16} ${WB.y + WB.h - 14}`}
                stroke={D35.red}
                strokeWidth={9}
                strokeLinecap="round"
                strokeDasharray={380}
                strokeDashoffset={380 * (1 - easeOut(seg(f, 12, 30)))}
              />
            </g>
          )}
        </g>
        {/* 枠をつなぐ縦線。#35 ではこれが引かれていく */}
        <line
          x1={FA.x + 150}
          y1={lineTop}
          x2={FA.x + 150}
          y2={lineTop + (lineBtm - lineTop) * (second ? 1 : draw)}
          stroke={D35.pencil}
          strokeWidth={7}
        />
        <line
          x1={FA.x + 150}
          y1={lineBtm}
          x2={SN.x + 174}
          y2={lineBtm}
          stroke={D35.pencil}
          strokeWidth={7}
          opacity={second ? 1 : easeOut(seg(f, 38, 48))}
        />
        {/* 子の枠 */}
        <g opacity={second ? 1 : easeOut(seg(f, 20, 36))}>
          <rect x={SN.x} y={SN.y} width={SN.w} height={SN.h} fill="none" stroke={D35.pencil} strokeWidth={6} />
          <rect x={SN.x + 7} y={SN.y + 7} width={SN.w - 14} height={SN.h - 14} fill="none" stroke={D35.pencil} strokeWidth={2} opacity={0.4} />
          {/* 父と同じ黒いターバン = 世襲を同じ物の反復で言う */}
          <TurbanSticker x={SN.x + 92} y={SN.y + 108} s={0.98} t={second ? 1 : easeOut(seg(f, 26, 44))} />
          <text x={SN.x + 192} y={SN.y + 72} fontFamily={SEKAI_SERIF} fontSize={36} fill={D35.ink}>
            モジタバ
          </text>
          <text x={SN.x + 192} y={SN.y + 120} fontFamily={SEKAI_FONT} fontSize={22} fill={D35.pencil}>
            息子
          </text>
          <text x={SN.x + 192} y={SN.y + 162} fontFamily={SEKAI_FONT} fontSize={22} fill={D35.pencil}>
            後継に選出
          </text>
          {/* #36 で付く傷の印。紙に貼られた小さな絆創膏の絵 */}
          {hurt > 0 && (
            <g transform={`translate(${SN.x + 300} ${SN.y + 176}) rotate(-24)`} opacity={hurt}>
              <rect x={-52} y={-16} width={104} height={32} rx={14} fill={D35.band} stroke={D35.line} strokeWidth={2.6} />
              <rect x={-16} y={-12} width={32} height={24} rx={3} fill={D35.bandPad} />
              {[-40, -32, 26, 34].map((hx) => (
                <circle key={hx} cx={hx} cy={0} r={2.4} fill={D35.bandPad} />
              ))}
            </g>
          )}
        </g>
        {/* #36 の消しゴムで消した跡 */}
        {second && (
          <g opacity={0.65}>
            <path d="M1160 596 Q1266 572 1370 604 Q1264 630 1160 596 Z" fill="#E6DFC8" />
            {Array.from({ length: 6 }, (_, i) => (
              <path
                key={i}
                d={`M${1180 + i * 32} ${600 + (i % 2) * 8} q18 -10 34 2`}
                fill="none"
                stroke={D35.pencil}
                strokeWidth={2.4}
                opacity={0.3}
              />
            ))}
            {/* 消しかす */}
            {[
              [1392, 612],
              [1408, 630],
              [1372, 638],
            ].map(([cx, cy], i) => (
              <ellipse key={i} cx={cx} cy={cy} rx={9} ry={5} fill={D35.eraser} stroke={D35.paperFold} strokeWidth={1.6} transform={`rotate(${i * 30} ${cx} ${cy})`} />
            ))}
          </g>
        )}
        {/* #36 の事件: インクが紙に滲んで広がる */}
        {blot > 0 && (
          <g>
            <circle cx={1296} cy={520} r={30 + blot * 104} fill={`url(#${uid}-blot)`} />
            <circle cx={1296} cy={520} r={16 + blot * 26} fill={D35.ink} opacity={0.88} />
            {Array.from({ length: 7 }, (_, i) => {
              const a = (i / 7) * Math.PI * 2 + 0.4;
              const r = (36 + blot * 112) * (0.72 + ((i * 7) % 5) * 0.08);
              return (
                <ellipse
                  key={i}
                  cx={1296 + Math.cos(a) * r}
                  cy={520 + Math.sin(a) * r * 0.74}
                  rx={10 + blot * 18}
                  ry={7 + blot * 13}
                  fill={D35.inkBled}
                  opacity={0.42 * blot}
                />
              );
            })}
            {/* 紙の繊維に沿って引かれる筋 */}
            {Array.from({ length: 5 }, (_, i) => (
              <line
                key={i}
                x1={1296}
                y1={520}
                x2={1296 + Math.cos(i * 1.3) * (60 + blot * 150)}
                y2={520 + Math.sin(i * 1.3) * (44 + blot * 96)}
                stroke={D35.inkBled}
                strokeWidth={4}
                opacity={0.3 * blot}
              />
            ))}
          </g>
        )}
        {/* 定規 (半透明) */}
        <g transform="translate(400 880) rotate(-7)">
          <rect x={-330} y={-34} width={660} height={68} rx={6} fill={D35.ruler} opacity={0.62} stroke={D35.rulerEdge} strokeWidth={3.4} />
          <line x1={-330} y1={-10} x2={330} y2={-10} stroke={D35.rulerEdge} strokeWidth={2.4} opacity={0.7} />
          {Array.from({ length: 23 }, (_, i) => (
            <line
              key={i}
              x1={-312 + i * 28}
              y1={-34}
              x2={-312 + i * 28}
              y2={i % 5 === 0 ? -2 : -16}
              stroke={D35.rulerMark}
              strokeWidth={2.6}
            />
          ))}
          {[0, 5, 10, 15, 20].map((i) => (
            <text
              key={i}
              x={-312 + i * 28}
              y={20}
              fontFamily={SEKAI_FONT}
              fontSize={17}
              fill={D35.rulerMark}
              textAnchor="middle"
              opacity={0.8}
            >
              {i}
            </text>
          ))}
        </g>
        {/* 記者の手と鉛筆。袖は現代の日本のシャツ */}
        <g transform={`translate(${1420 + jitter} ${880}) rotate(${-14 + jitter * 0.6})`}>
          {/* 鉛筆 */}
          <g transform="rotate(-46)">
            <rect x={-26} y={-320} width={52} height={300} fill={D35.woodPencil} stroke={D35.line} strokeWidth={3.4} />
            <rect x={-26} y={-320} width={17} height={300} fill={D35.woodPencilDark} opacity={0.6} />
            <rect x={-26} y={-340} width={52} height={22} fill="#8E99A6" stroke={D35.line} strokeWidth={3} />
            <rect x={-26} y={-368} width={52} height={28} rx={6} fill="#D9736C" stroke={D35.line} strokeWidth={3} />
            <path d="M-26 -20 L0 36 L26 -20 Z" fill="#E8D8B4" stroke={D35.line} strokeWidth={3.2} />
            <path d="M-11 10 L0 36 L11 10 Z" fill={D35.graphite} />
          </g>
          {/* 手 */}
          <path
            d="M-120 20 Q-70 -96 10 -120 Q92 -140 140 -72 Q182 -12 164 76 Q148 156 62 176 Q-26 194 -86 136 Q-136 88 -120 20 Z"
            fill={D35.skin}
            stroke={D35.line}
            strokeWidth={4}
          />
          {/* 親指 */}
          <path d="M-96 -14 Q-54 -78 -4 -72 Q28 -66 24 -30 Q20 10 -24 24 Q-76 38 -96 -14 Z" fill={D35.skin} stroke={D35.line} strokeWidth={4} />
          {/* 人差し指が鉛筆に掛かる */}
          <path d="M-18 -112 Q50 -150 96 -112 Q122 -88 104 -58 Q78 -32 24 -46 Q-18 -60 -18 -112 Z" fill={D35.skin} stroke={D35.line} strokeWidth={4} />
          {/* 指の関節 */}
          <path d="M8 -74 Q44 -86 76 -74" fill="none" stroke={D35.skinShade} strokeWidth={3.4} opacity={0.8} />
          <path d="M-52 102 Q4 128 66 112" fill="none" stroke={D35.skinShade} strokeWidth={3.4} opacity={0.7} />
          <path d="M-72 56 Q-16 84 48 68" fill="none" stroke={D35.skinShade} strokeWidth={3} opacity={0.6} />
          {/* 爪 */}
          <ellipse cx={92} cy={-100} rx={17} ry={12} fill="#F2D2B6" stroke={D35.skinShade} strokeWidth={2.4} transform="rotate(-22 92 -100)" />
          {/* 袖 (現代の日本のシャツ) */}
          <path d="M-96 108 Q-40 176 54 170 L104 300 Q-20 352 -148 272 Z" fill={D35.shirt} stroke={D35.line} strokeWidth={4} />
          <path d="M-100 150 Q-28 214 70 206" fill="none" stroke={D35.shirtShade} strokeWidth={9} opacity={0.8} />
          <path d="M-112 182 Q-32 250 80 240" fill="none" stroke={D35.line} strokeWidth={3.4} opacity={0.4} />
          <circle cx={-72} cy={212} r={10} fill={D35.cuffBtn} stroke={D35.line} strokeWidth={2.6} />
        </g>
        {/* 札 */}
        <Fuda
          x={1560}
          y={200}
          text={second ? "妻 死亡 / 本人 負傷" : "世襲"}
          t={easeOut(seg(f, second ? 30 : 48, second ? 48 : 64))}
          size={28}
          tone={D35.red}
        />
      </Cam>
      <YearTag year="二〇二六" place={second ? "報道" : "系図"} f={f} />
    </>
  );
};

const S35: SekaiArt = ({ f }) => <Keizu f={f} uid="d35" />;
const S36: SekaiArt = ({ f }) => <Keizu f={f} uid="d36" second />;

// ===================================================================
// #37 山「イランは反撃し、ホルムズ海峡を封鎖しました。」
// ===================================================================
// 海面すれすれ。高速ボートの舳先からタンカーを見上げる。
// 顔が画面の高さの1/4以上になる寄り (1枚目)。地図に×を描くだけで済ませない。
const D37 = {
  sky: "#8FA8BC",
  skyHi: "#B6C8D2",
  haze: "#CBD6DB", // 対岸は霞む
  omanRock: "#8A6A4E", // 南岸オマーンの褐色の岩山
  omanRockHaze: "#A08A74",
  umi: "#1E5F8C", // 海
  umiDeep: "#123F62",
  umiLit: "#3C83B2",
  nami: "#D6E8F0", // 白波
  funataiKuro: "#141618", // VLCCの黒い舷側
  funataiSheen: "#2E343A",
  funazoko: "#8E2B21", // 喫水線の赤
  bootTop: "#D8D2C4",
  kanpan: "#3A3F42", // 甲板
  haikan: "#17191B", // 甲板中央線の太い黒の原油配管
  haikanRing: "#4A4E52",
  kyojuu: "#EDEFF0", // 船尾寄りの白い居住区ブロック
  kyojuuKage: "#C0C6CA",
  entotsu: "#1E2226",
  mado: "#2B4C60",
  moji: "#E8EAEA", // 船名・喫水標
  boat: "#7E858A", // IRGCの小型高速ボート (迷彩ではなく灰色)
  boatDark: "#4E5559",
  boatLit: "#A8AFB4",
  scuff: "#5E6468", // 舷側の擦れ
  shio: "#E4E8EA", // 塩の跡
  helmet: "#4C5346",
  helmetLit: "#6E7765",
  vest: "#C45A1E", // 救命胴衣
  vestLit: "#E8832E",
  strap: "#2E2A24",
  fuku: "#5A6052",
  hada: "#C08457", // 日焼け
  hadaKage: "#8A5330",
  hige: "#3A3028",
  gun: "#3A3E42", // 前甲板の機銃
  line: "#14100C",
};

const S37: SekaiArt = ({ f }) => {
  const uid = "d37";
  // 事件: タンカーが止まる。航跡の泡が消える
  const wake = 1 - easeInOut(seg(f, 14, 58));
  const roll = Math.sin(f / 11) * 1.3; // 艇の揺れ
  const spray = easeOut(seg(f, 0, 14));
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D37.sky} />
          <stop offset="70%" stopColor={D37.skyHi} />
          <stop offset="100%" stopColor={D37.haze} />
        </linearGradient>
        <linearGradient id={`${uid}-umi`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D37.umiLit} />
          <stop offset="34%" stopColor={D37.umi} />
          <stop offset="100%" stopColor={D37.umiDeep} />
        </linearGradient>
        <linearGradient id={`${uid}-hull`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D37.funataiSheen} />
          <stop offset="26%" stopColor={D37.funataiKuro} />
          <stop offset="100%" stopColor="#0C0E10" />
        </linearGradient>
      </defs>
      <Cam f={f} from={[-18, 26, 1.06]} to={[8, -8, 1.0]} start={0} end={84}>
        {/* 空 */}
        <rect x={-200} y={-200} width={W + 400} height={660} fill={`url(#${uid}-sky)`} />
        {/* 南岸オマーン (ムサンダム半島) の岩山。最狭部でも39kmあるので対岸は霞む */}
        <g opacity={0.55}>
          <path
            d="M-200 452 L60 392 L180 416 L340 356 L470 404 L620 368 L760 410 L900 374 L1060 412 L1240 382 L1420 418 L1620 386 L1820 420 L2120 400 L2120 452 Z"
            fill={D37.omanRockHaze}
          />
          <path
            d="M240 414 L340 356 L430 402 L380 396 L340 384 L300 398 Z M960 400 L1060 412 L1140 392 Z"
            fill={D37.omanRock}
            opacity={0.5}
          />
        </g>
        <rect x={-200} y={430} width={W + 400} height={34} fill={D37.haze} opacity={0.6} />
        {/* 海 */}
        <rect x={-200} y={452} width={W + 400} height={700} fill={`url(#${uid}-umi)`} />
        {/* うねり */}
        {Array.from({ length: 16 }, (_, i) => (
          <path
            key={i}
            d={`M${-200 + ((i * 173) % 2200)} ${500 + i * 36} q70 ${-12 - (i % 3) * 5} 150 0 q80 12 160 0`}
            fill="none"
            stroke={D37.umiLit}
            strokeWidth={4}
            opacity={0.3}
          />
        ))}
        {/* VLCCタンカー。全長330m級。煙突と船橋は船尾に寄せる */}
        <g>
          {/* 黒い舷側 */}
          <path d="M-120 276 L1346 356 L1346 648 L-120 736 Z" fill={`url(#${uid}-hull)`} />
          {/* 舷側の見切り線 (ブートトップ) と喫水線の赤 */}
          <path d="M-120 700 L1346 620 L1346 644 L-120 728 Z" fill={D37.bootTop} opacity={0.8} />
          <path d="M-120 724 L1346 640 L1346 700 L-120 800 Z" fill={D37.funazoko} />
          {/* 舷側の継ぎ目 */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <line
              key={i}
              x1={-60 + i * 210}
              y1={282 + i * 11}
              x2={-60 + i * 210}
              y2={732 - i * 12}
              stroke={D37.funataiSheen}
              strokeWidth={3}
              opacity={0.45}
            />
          ))}
          <path d="M-120 420 L1346 468" stroke={D37.funataiSheen} strokeWidth={5} opacity={0.4} />
          {/* 喫水標 */}
          <g opacity={0.9}>
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <rect x={180} y={560 + i * 32} width={44} height={6} fill={D37.moji} />
                <text x={240} y={570 + i * 32} fontFamily={SEKAI_FONT} fontSize={20} fill={D37.moji}>
                  {22 - i}
                </text>
              </g>
            ))}
          </g>
          {/* 船名 */}
          <text x={430} y={400} fontFamily={SEKAI_FONT} fontSize={44} fill={D37.moji} opacity={0.82} letterSpacing={9}>
            TANKER
          </text>
          {/* 甲板。中央線に太い黒の原油配管とマニフォールド */}
          <path d="M-120 276 L1346 356 L1346 320 L-120 236 Z" fill={D37.kanpan} />
          <path d="M-120 236 L1346 320" stroke={D37.boatLit} strokeWidth={5} opacity={0.5} />
          {/* 手すり */}
          <path d="M-120 212 L1346 300" stroke={D37.kanpan} strokeWidth={5} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line key={i} x1={-80 + i * 180} y1={236 + i * 10} x2={-80 + i * 180} y2={210 + i * 11} stroke={D37.kanpan} strokeWidth={4} />
          ))}
          {/* 原油配管 */}
          <path d="M-120 196 L1020 262" stroke={D37.haikan} strokeWidth={26} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={-60 + i * 190} y={178 + i * 11} width={16} height={34} fill={D37.haikanRing} />
          ))}
          {/* マニフォールド (舷側へ出る接続口) */}
          <g>
            <path d="M560 232 L560 300" stroke={D37.haikan} strokeWidth={22} />
            <path d="M620 236 L620 300" stroke={D37.haikan} strokeWidth={22} />
            <circle cx={560} cy={306} r={18} fill={D37.haikanRing} stroke={D37.line} strokeWidth={3} />
            <circle cx={620} cy={308} r={18} fill={D37.haikanRing} stroke={D37.line} strokeWidth={3} />
          </g>
          {/* 船尾寄りの白い居住区ブロックと煙突 */}
          <g>
            <rect x={1030} y={92} width={300} height={198} fill={D37.kyojuu} stroke={D37.line} strokeWidth={4} />
            <rect x={1030} y={92} width={300} height={198} fill="none" stroke={D37.kyojuuKage} strokeWidth={3} />
            {[0, 1, 2, 3].map((r) => (
              <g key={r}>
                {[0, 1, 2, 3, 4].map((c) => (
                  <rect
                    key={c}
                    x={1048 + c * 56}
                    y={110 + r * 46}
                    width={40}
                    height={26}
                    fill={D37.mado}
                    opacity={0.85}
                  />
                ))}
              </g>
            ))}
            <rect x={1016} y={66} width={328} height={30} fill={D37.kyojuu} stroke={D37.line} strokeWidth={4} />
            {/* 船橋の窓 */}
            <rect x={1032} y={72} width={296} height={18} fill={D37.mado} opacity={0.9} />
            {/* 煙突 */}
            <path d="M1148 66 L1160 -10 L1240 -10 L1248 66 Z" fill={D37.entotsu} stroke={D37.line} strokeWidth={4} />
            <rect x={1162} y={14} width={76} height={20} fill={D37.funazoko} />
            {/* 止まったので煙は出ていない */}
          </g>
        </g>
        {/* 航跡の泡。事件: タンカーが止まり、これが消える */}
        <g opacity={wake}>
          <path d="M-120 736 Q400 690 1346 648 L1346 690 Q380 744 -120 790 Z" fill={D37.nami} opacity={0.72} />
          {Array.from({ length: 18 }, (_, i) => (
            <ellipse
              key={i}
              cx={-80 + i * 84}
              cy={742 - i * 5 + ((i * 31) % 18)}
              rx={30 + ((i * 13) % 26)}
              ry={11}
              fill={D37.nami}
              opacity={0.6}
            />
          ))}
        </g>
        {/* 2隻目の高速ボート。船外機2基が見える */}
        <g transform={`translate(0 ${roll * 2})`}>
          <path d="M150 742 L560 736 L600 766 L540 796 L190 800 L140 772 Z" fill={D37.boat} stroke={D37.line} strokeWidth={4} />
          <path d="M150 742 L560 736 L556 752 L156 758 Z" fill={D37.boatLit} opacity={0.7} />
          <path d="M190 800 L540 796 L536 784 L192 788 Z" fill={D37.boatDark} />
          <path d="M240 764 L300 760 M360 762 L430 758" stroke={D37.scuff} strokeWidth={5} opacity={0.8} />
          {/* 船外機2基 */}
          <rect x={130} y={744} width={30} height={60} rx={5} fill={D37.boatDark} stroke={D37.line} strokeWidth={3} />
          <rect x={160} y={748} width={28} height={56} rx={5} fill={D37.boatDark} stroke={D37.line} strokeWidth={3} />
          <path d="M136 804 L150 834 L170 834 L178 804" fill={D37.boatDark} stroke={D37.line} strokeWidth={3} />
          {/* 乗っている兵 (遠いので小さい) */}
          {[320, 380, 448].map((bx, i) => (
            <g key={bx}>
              <rect x={bx - 13} y={690} width={26} height={48} rx={6} fill={D37.vest} stroke={D37.line} strokeWidth={2.6} />
              <circle cx={bx} cy={678} r={14} fill={D37.hada} stroke={D37.line} strokeWidth={2.6} />
              <path d={`M${bx - 15} 672 Q${bx} 656 ${bx + 15} 672 Z`} fill={D37.helmet} stroke={D37.line} strokeWidth={2.4} />
              <circle cx={bx - 5} cy={678} r={2.4} fill={D37.line} />
              <circle cx={bx + 5} cy={678} r={2.4} fill={D37.line} />
              <path d={`M${bx - 5} 686 Q${bx} 690 ${bx + 5} 686`} fill="none" stroke={D37.line} strokeWidth={2} opacity={0.7} />
              {i === 1 && <path d={`M${bx + 13} 700 L${bx + 70} 672`} stroke={D37.gun} strokeWidth={6} />}
            </g>
          ))}
          <ellipse cx={370} cy={806} rx={230} ry={18} fill={D37.nami} opacity={0.5 * wake} />
        </g>
        {/* 手前 = 自分が乗っている艇の前甲板 */}
        <g transform={`rotate(${roll} 1100 1080)`}>
          <path d="M360 1120 L1050 792 L1290 792 L1920 1120 Z" fill={D37.boat} stroke={D37.line} strokeWidth={5} />
          <path d="M1050 792 L1290 792 L1270 826 L1070 826 Z" fill={D37.boatLit} opacity={0.75} />
          {/* 舷側の擦れ */}
          {[
            [520, 1060, 220],
            [640, 1004, 180],
            [1540, 1040, 200],
          ].map(([sx, sy, sw], i) => (
            <path
              key={i}
              d={`M${sx} ${sy} q${(sw as number) / 2} ${-14} ${sw} ${-4}`}
              fill="none"
              stroke={D37.scuff}
              strokeWidth={7}
              opacity={0.75}
            />
          ))}
          {/* 塩の跡 */}
          {Array.from({ length: 20 }, (_, i) => (
            <ellipse
              key={i}
              cx={470 + ((i * 263) % 1340)}
              cy={860 + ((i * 97) % 220)}
              rx={14 + ((i * 7) % 20)}
              ry={7}
              fill={D37.shio}
              opacity={0.3}
            />
          ))}
          {/* 甲板の滑り止めと縫い目 */}
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={520 + i * 90} y1={1120} x2={1058 + i * 50} y2={800} stroke={D37.boatDark} strokeWidth={3} opacity={0.5} />
          ))}
          {/* 前甲板の機銃 */}
          <g transform="translate(1168 800)">
            <path d="M-56 44 L-20 -6 L20 -6 L56 44 Z" fill={D37.gun} stroke={D37.line} strokeWidth={4} />
            <rect x={-14} y={-26} width={28} height={24} rx={4} fill={D37.gun} stroke={D37.line} strokeWidth={3} />
            <g transform="rotate(-34)">
              <rect x={-10} y={-220} width={20} height={200} rx={4} fill={D37.gun} stroke={D37.line} strokeWidth={3} />
              <rect x={-16} y={-240} width={32} height={26} rx={4} fill="#2A2E32" stroke={D37.line} strokeWidth={3} />
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1={-10} y1={-200 + i * 30} x2={10} y2={-200 + i * 30} stroke="#55595D" strokeWidth={3} />
              ))}
              <rect x={10} y={-130} width={40} height={54} rx={5} fill="#4A4E52" stroke={D37.line} strokeWidth={3} />
            </g>
          </g>
          {/* 飛沫 */}
          {Array.from({ length: 12 }, (_, i) => (
            <circle
              key={i}
              cx={430 + ((i * 211) % 1400)}
              cy={930 + ((i * 131) % 140)}
              r={4 + (i % 3) * 3}
              fill={D37.nami}
              opacity={0.42 * spray}
            />
          ))}
        </g>
        {/* 2人目の兵 (機銃のそば) */}
        <g transform={`translate(1308 648) scale(0.56) rotate(${roll * 0.6})`}>
          <path d="M-104 420 Q-120 180 -58 92 L58 92 Q120 180 104 420 Z" fill={D37.vest} stroke={D37.line} strokeWidth={6} />
          <path d="M-58 92 L-58 420 M58 92 L58 420" stroke={D37.strap} strokeWidth={14} />
          <rect x={-70} y={210} width={140} height={26} fill={D37.strap} />
          <circle cx={0} cy={0} r={92} fill={D37.hada} stroke={D37.line} strokeWidth={6} />
          <path d="M-96 -16 Q-80 -108 0 -112 Q80 -108 96 -16 Q60 -56 0 -54 Q-60 -56 -96 -16 Z" fill={D37.helmet} stroke={D37.line} strokeWidth={6} />
          <path d="M-92 -8 Q-64 44 -58 86" fill="none" stroke={D37.strap} strokeWidth={10} />
          <path d="M-46 -8 Q-24 -20 -4 -8" fill="none" stroke={D37.line} strokeWidth={7} strokeLinecap="round" />
          <path d="M6 -8 Q26 -20 48 -8" fill="none" stroke={D37.line} strokeWidth={7} strokeLinecap="round" />
          <path d="M-50 14 Q-26 2 -4 14" fill="none" stroke={D37.line} strokeWidth={8} strokeLinecap="round" />
          <path d="M6 14 Q28 2 50 14" fill="none" stroke={D37.line} strokeWidth={8} strokeLinecap="round" />
          <path d="M2 24 Q-10 52 4 58" fill="none" stroke={D37.hadaKage} strokeWidth={7} />
          <path d="M-32 76 Q0 66 32 76" fill="none" stroke={D37.line} strokeWidth={8} strokeLinecap="round" />
        </g>
        {/* 1人目の兵。顔が画面の高さの1/4以上 */}
        <g transform={`translate(1636 548) rotate(${roll * 0.5})`}>
          {/* 肩と救命胴衣 */}
          <path d="M-300 560 Q-280 300 -150 232 L170 232 Q310 304 330 560 Z" fill={D37.fuku} stroke={D37.line} strokeWidth={6} />
          <path d="M-238 560 Q-226 316 -120 258 L140 258 Q256 320 268 560 Z" fill={D37.vest} stroke={D37.line} strokeWidth={6} />
          <path d="M-120 258 L-120 560 M140 258 L140 560" stroke={D37.vestLit} strokeWidth={10} opacity={0.6} />
          <rect x={-200} y={420} width={420} height={40} rx={6} fill={D37.strap} />
          <rect x={-40} y={404} width={86} height={72} rx={8} fill="#55595D" stroke={D37.line} strokeWidth={5} />
          <path d="M-200 346 L220 346" stroke={D37.strap} strokeWidth={16} />
          {/* 塩の跡 */}
          {[
            [-170, 500],
            [-90, 536],
            [200, 492],
          ].map(([sx, sy], i) => (
            <ellipse key={i} cx={sx} cy={sy} rx={40} ry={14} fill={D37.shio} opacity={0.34} />
          ))}
          {/* 首 */}
          <rect x={-56} y={130} width={112} height={118} fill={D37.hadaKage} />
          {/* 顔。面長・日焼け */}
          <ellipse cx={0} cy={0} rx={134} ry={168} fill={D37.hada} stroke={D37.line} strokeWidth={6} />
          <path d="M-134 30 Q-100 150 0 172 Q100 150 134 30 Q96 110 0 116 Q-96 110 -134 30 Z" fill={D37.hadaKage} opacity={0.45} />
          {/* 耳 */}
          <ellipse cx={-134} cy={10} rx={20} ry={34} fill={D37.hada} stroke={D37.line} strokeWidth={5} />
          <ellipse cx={134} cy={10} rx={20} ry={34} fill={D37.hada} stroke={D37.line} strokeWidth={5} />
          {/* ヘルメット */}
          <path
            d="M-144 -34 Q-138 -176 0 -182 Q138 -176 144 -34 Q96 -92 0 -88 Q-96 -92 -144 -34 Z"
            fill={D37.helmet}
            stroke={D37.line}
            strokeWidth={6}
          />
          <path d="M-128 -84 Q0 -148 128 -84" fill="none" stroke={D37.helmetLit} strokeWidth={9} opacity={0.7} />
          <path d="M-150 -30 L150 -30" stroke={D37.helmet} strokeWidth={22} />
          <path d="M-150 -30 L150 -30" stroke={D37.line} strokeWidth={5} opacity={0.5} />
          {/* 顎紐 */}
          <path d="M-140 -14 Q-128 86 -72 128" fill="none" stroke={D37.strap} strokeWidth={14} />
          <path d="M140 -14 Q128 86 72 128" fill="none" stroke={D37.strap} strokeWidth={14} />
          <rect x={-40} y={120} width={80} height={26} rx={6} fill={D37.strap} />
          {/* 眉 (太い) */}
          <path d="M-96 -26 Q-58 -48 -22 -30" fill="none" stroke={D37.hige} strokeWidth={15} strokeLinecap="round" />
          <path d="M22 -30 Q58 -48 96 -26" fill="none" stroke={D37.hige} strokeWidth={15} strokeLinecap="round" />
          {/* 目。風で細めている (白目は細く、瞳が上から覗く) */}
          <path d="M-100 8 Q-60 -22 -20 6 Q-60 18 -100 8 Z" fill="#F2EFE6" stroke={D37.line} strokeWidth={5} />
          <path d="M20 6 Q60 -22 100 8 Q60 18 20 6 Z" fill="#F2EFE6" stroke={D37.line} strokeWidth={5} />
          <path d="M-78 -6 a22 22 0 0 1 36 2 q-18 14 -36 -2 Z" fill="#2A2420" />
          <path d="M42 -4 a22 22 0 0 1 36 2 q-18 14 -36 -2 Z" fill="#2A2420" />
          <circle cx={-56} cy={-2} r={3.4} fill="#FFFFFF" />
          <circle cx={64} cy={0} r={3.4} fill="#FFFFFF" />
          {/* 目尻の皺 (日差しと風) */}
          <path d="M-106 16 L-128 26 M-104 24 L-124 40" stroke={D37.hadaKage} strokeWidth={5} strokeLinecap="round" />
          <path d="M106 16 L128 26 M104 24 L124 40" stroke={D37.hadaKage} strokeWidth={5} strokeLinecap="round" />
          {/* 鼻 */}
          <path d="M4 14 Q-16 66 6 78" fill="none" stroke={D37.line} strokeWidth={6} strokeLinecap="round" />
          <path d="M6 78 Q26 74 30 60" fill="none" stroke={D37.hadaKage} strokeWidth={5} />
          {/* 口 (結んでいる) */}
          <path d="M-46 112 Q0 102 46 112" fill="none" stroke={D37.line} strokeWidth={8} strokeLinecap="round" />
          <path d="M-30 126 Q0 134 30 126" fill="none" stroke={D37.hadaKage} strokeWidth={5} opacity={0.8} />
          {/* 無精髭 */}
          {Array.from({ length: 46 }, (_, i) => {
            const a = (i / 46) * Math.PI;
            const r = 96 + ((i * 11) % 22);
            return (
              <circle
                key={i}
                cx={Math.cos(a + Math.PI) * r * 0.96}
                cy={78 + Math.sin(a) * 52}
                r={2.6}
                fill={D37.hige}
                opacity={0.5}
              />
            );
          })}
        </g>
        <Fuda x={300} y={168} text="ホルムズ海峡 封鎖" t={easeOut(seg(f, 30, 50))} size={30} tone={WP.alert} />
      </Cam>
      <YearTag year="二〇二六" place="ホルムズ" f={f} />
    </>
  );
};

// ===================================================================
// #38 並「世界の石油のおよそ5分の1が通る、海の道です。」(全景可)
// ===================================================================
// 俯瞰。海峡を斜め上から。最狭部は約39km。運河のように両岸を近づけない。
const D38 = {
  haze: "#CBD6DB",
  sky: "#9FB6C6",
  iran: "#6E6A4A", // 北=イラン側の山がちな海岸
  iranRidge: "#8A8460",
  iranHaze: "#A2A488",
  oman: "#8A6A4E", // 南=オマーン (ムサンダム半島) の岩山
  omanRidge: "#A88A66",
  omanShade: "#5E4630",
  umi: "#1E5F8C",
  umiDeep: "#13456B",
  umiLit: "#3C83B2",
  nami: "#D6E8F0",
  lane: "#EDEFF0", // 分離通航帯の表示
  zone: "#F2C230", // 分離帯
  ship: "#2A2E32", // タンカー
  shipWhite: "#EDEFF0",
  shipRed: "#8E2B21",
  odd: "#C9872A", // 5隻のうち1隻だけ色を変える
  oddLit: "#F0B45C",
  moji: "#F2EDE1",
  line: "#14100C",
};

const S38: SekaiArt = ({ f }) => {
  const uid = "d38";
  // 事件: 1隻だけが向きを変えて引き返す
  const turn = easeInOut(seg(f, 20, 62));
  const flow = (f % 240) / 240;
  // 入航レーンの船 (左へ進む) 4隻
  const inbound = [0.12, 0.34, 0.58, 0.82];
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-umi`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D38.umiDeep} />
          <stop offset="40%" stopColor={D38.umi} />
          <stop offset="100%" stopColor={D38.umiLit} />
        </linearGradient>
        <linearGradient id={`${uid}-iran`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D38.iranHaze} />
          <stop offset="100%" stopColor={D38.iran} />
        </linearGradient>
        <linearGradient id={`${uid}-oman`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D38.oman} />
          <stop offset="100%" stopColor={D38.omanShade} />
        </linearGradient>
      </defs>
      <Cam f={f} from={[0, -14, 1.04]} to={[-20, 10, 1.0]} start={0} end={84}>
        {/* 遠くの空と霞 */}
        <rect x={-200} y={-200} width={W + 400} height={400} fill={D38.sky} />
        <rect x={-200} y={120} width={W + 400} height={90} fill={D38.haze} opacity={0.8} />
        {/* 北=イラン側。山がちな海岸。遠いので霞む */}
        <g>
          <path
            d="M-200 196 L80 150 L300 182 L520 134 L760 176 L980 140 L1240 184 L1480 142 L1720 180 L2120 150 L2120 404 L-200 404 Z"
            fill={`url(#${uid}-iran)`}
          />
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d={`M${-100 + i * 240} 400 L${10 + i * 240} 196 L${120 + i * 240} 400 Z`}
              fill={D38.iranRidge}
              opacity={0.26}
            />
          ))}
          {/* 入り江 */}
          <path d="M-200 380 Q140 318 420 396 Q740 330 1020 400 Q1340 338 1640 402 Q1880 360 2120 398 L2120 440 L-200 440 Z" fill={D38.iran} />
          <path
            d="M-200 404 Q140 342 420 420 Q740 354 1020 424 Q1340 362 1640 426 Q1880 384 2120 422"
            fill="none"
            stroke={D38.nami}
            strokeWidth={7}
            opacity={0.65}
          />
        </g>
        {/* 海 */}
        <rect x={-200} y={420} width={W + 400} height={560} fill={`url(#${uid}-umi)`} />
        {Array.from({ length: 22 }, (_, i) => (
          <path
            key={i}
            d={`M${-200 + ((i * 197) % 2300)} ${452 + i * 24} q80 -10 170 0`}
            fill="none"
            stroke={D38.umiLit}
            strokeWidth={3.4}
            opacity={0.26}
          />
        ))}
        {/* 最狭部の幅 */}
        <g opacity={easeOut(seg(f, 26, 46))}>
          <line x1={1452} y1={412} x2={1452} y2={924} stroke={D38.moji} strokeWidth={4} strokeDasharray="14 12" />
          <path d="M1452 412 L1440 440 L1464 440 Z" fill={D38.moji} />
          <path d="M1452 924 L1440 896 L1464 896 Z" fill={D38.moji} />
          <rect x={1476} y={632} width={196} height={74} rx={4} fill={WP.kinari} />
          <rect x={1476} y={632} width={6} height={74} fill={WP.alert} />
          <text x={1578} y={666} fontFamily={SEKAI_SERIF} fontSize={30} fontWeight={700} fill={WP.line} textAnchor="middle">
            最狭部
          </text>
          <text x={1578} y={698} fontFamily={SEKAI_FONT} fontSize={26} fill={WP.line} textAnchor="middle">
            約39km
          </text>
        </g>
        {/* 分離通航帯。主要航路はオマーン側 */}
        <g>
          {/* 入航レーン */}
          <path d="M-200 740 L2120 700 L2120 660 L-200 700 Z" fill={D38.lane} opacity={0.1} />
          <line x1={-200} y1={700} x2={2120} y2={660} stroke={D38.lane} strokeWidth={4} strokeDasharray="44 34" opacity={0.75} />
          <line x1={-200} y1={742} x2={2120} y2={702} stroke={D38.lane} strokeWidth={4} strokeDasharray="44 34" opacity={0.75} />
          {/* 分離帯 */}
          <path d="M-200 742 L2120 702 L2120 772 L-200 812 Z" fill={D38.zone} opacity={0.17} />
          <line x1={-200} y1={777} x2={2120} y2={737} stroke={D38.zone} strokeWidth={6} strokeDasharray="20 24" opacity={0.7} />
          {/* 出航レーン */}
          <path d="M-200 812 L2120 772 L2120 830 L-200 870 Z" fill={D38.lane} opacity={0.1} />
          <line x1={-200} y1={814} x2={2120} y2={774} stroke={D38.lane} strokeWidth={4} strokeDasharray="44 34" opacity={0.75} />
          <line x1={-200} y1={872} x2={2120} y2={832} stroke={D38.lane} strokeWidth={4} strokeDasharray="44 34" opacity={0.75} />
          {/* レーンの向きの矢印 */}
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} opacity={0.6}>
              <path d={`M${300 + i * 320} 718 L${200 + i * 320} 722 L${232 + i * 320} 708 M${200 + i * 320} 722 L${236 + i * 320} 734`} fill="none" stroke={D38.lane} strokeWidth={4} />
              <path d={`M${200 + i * 320} 838 L${300 + i * 320} 834 L${268 + i * 320} 822 M${300 + i * 320} 834 L${264 + i * 320} 848`} fill="none" stroke={D38.lane} strokeWidth={4} />
            </g>
          ))}
          <text x={190} y={690} fontFamily={SEKAI_FONT} fontSize={24} fill={D38.moji} opacity={0.8}>
            入航レーン
          </text>
          <text x={190} y={900} fontFamily={SEKAI_FONT} fontSize={24} fill={D38.moji} opacity={0.8}>
            出航レーン
          </text>
        </g>
        {/* 南=オマーン (ムサンダム半島) の岩山。手前なので細部が出る */}
        <g>
          <path
            d="M-200 980 L40 916 L180 946 L360 880 L540 934 L700 886 L900 944 L1080 892 L1280 948 L1480 896 L1700 946 L1920 900 L2120 952 L2120 1140 L-200 1140 Z"
            fill={`url(#${uid}-oman)`}
          />
          {[
            [60, 916, 150],
            [380, 880, 180],
            [720, 886, 160],
            [1100, 892, 190],
            [1500, 896, 170],
          ].map(([rx, ry, rw], i) => (
            <path
              key={i}
              d={`M${(rx as number) - (rw as number) / 2} 1100 L${rx} ${ry} L${(rx as number) + (rw as number) / 2} 1100 Z`}
              fill={D38.omanRidge}
              opacity={0.34}
            />
          ))}
          {/* 切り立った谷 (ホルムズのフィヨルド) */}
          {[240, 620, 980, 1360, 1760].map((vx, i) => (
            <path
              key={vx}
              d={`M${vx} 1140 L${vx - 30} 960 L${vx + 36} 958 Z`}
              fill={D38.omanShade}
              opacity={0.6}
            />
          ))}
          <path
            d="M-200 980 Q120 938 360 982 Q640 930 920 988 Q1220 934 1500 988 Q1760 942 2120 984"
            fill="none"
            stroke={D38.nami}
            strokeWidth={8}
            opacity={0.75}
          />
        </g>
        {/* 数珠つなぎのタンカー。入航レーンに4隻 */}
        {inbound.map((p, i) => {
          const t = (p + flow) % 1;
          const sx = 2060 - t * 2260;
          const sy = 720 - t * 38;
          return (
            <g key={i} transform={`translate(${sx} ${sy}) scale(0.92)`}>
              <ellipse cx={0} cy={16} rx={132} ry={17} fill={D38.line} opacity={0.22} />
              <path d="M-128 -16 L96 -16 L132 0 L96 16 L-128 16 Z" fill={D38.ship} stroke={D38.line} strokeWidth={3.4} />
              <path d="M-128 -16 L96 -16 L124 -4 L-128 -4 Z" fill="#3E4449" />
              <rect x={-126} y={-6} width={210} height={6} fill={D38.shipRed} opacity={0.75} />
              <path d="M-100 -12 L84 -12" stroke="#14161A" strokeWidth={7} />
              <rect x={-126} y={-16} width={34} height={32} fill={D38.shipWhite} stroke={D38.line} strokeWidth={3} />
              <rect x={-120} y={-28} width={22} height={14} fill={D38.shipWhite} stroke={D38.line} strokeWidth={2.6} />
              {/* 航跡 */}
              <path d="M132 0 Q260 -4 400 2" fill="none" stroke={D38.nami} strokeWidth={9} opacity={0.5} />
              <path d="M132 -8 Q250 -16 370 -12" fill="none" stroke={D38.nami} strokeWidth={5} opacity={0.32} />
            </g>
          );
        })}
        {/* 5隻のうち1隻だけ色を変える。事件: これが向きを変えて引き返す */}
        <g
          transform={`translate(${760 + turn * 150} ${830 - turn * 6}) rotate(${turn * 180}) scale(0.96)`}
        >
          <ellipse cx={0} cy={18} rx={140} ry={18} fill={D38.line} opacity={0.22} />
          <path d="M-132 -17 L100 -17 L138 0 L100 17 L-132 17 Z" fill={D38.odd} stroke={D38.line} strokeWidth={3.6} />
          <path d="M-132 -17 L100 -17 L128 -5 L-132 -5 Z" fill={D38.oddLit} />
          <rect x={-130} y={-6} width={216} height={7} fill={D38.shipRed} opacity={0.8} />
          <path d="M-104 -12 L88 -12" stroke="#5E3A10" strokeWidth={7} />
          <rect x={-130} y={-17} width={36} height={34} fill={D38.shipWhite} stroke={D38.line} strokeWidth={3} />
          <rect x={-124} y={-30} width={24} height={15} fill={D38.shipWhite} stroke={D38.line} strokeWidth={2.6} />
        </g>
        {/* 引き返す航跡が弧を描く */}
        <path
          d={`M900 834 q${120 * turn} ${-60 * turn} ${230 * turn} ${-10 * turn}`}
          fill="none"
          stroke={D38.nami}
          strokeWidth={9}
          opacity={0.55 * turn}
        />
        {/* 札 */}
        <Fuda x={276} y={248} text="イラン" t={easeOut(seg(f, 10, 28))} size={30} tone={WP.signGreen} />
        <Fuda x={330} y={1028} text="オマーン" t={easeOut(seg(f, 14, 32))} size={30} tone={WP.rust} />
        <Fuda x={940} y={520} text="世界の石油の五分の一" t={easeOut(seg(f, 40, 60))} size={34} tone={WP.alert} />
      </Cam>
      <YearTag year="二〇二六" place="ホルムズ" f={f} />
    </>
  );
};

// ===================================================================
// #39 山「日本のガソリンが補助金で170円前後に抑え込まれているのは、このためです。」
// ===================================================================
// 冒頭3分の着地。イランの話が視聴者の財布まで下りてくる1枚。
// 顔の寄り (2枚目)。円グラフ・棒グラフだけで済ませない。老若男女を混ぜる。
const D39 = {
  skyHi: "#3E4E79", // 夕方の空の上
  skyMid: "#8E5F62",
  skyLow: "#E0894A", // 地平の橙
  cloud: "#F2C08E",
  cloudShade: "#B4756A",
  yane: "#E8E4DA", // スタンドの屋根 (キャノピー)
  yaneKage: "#BDB8AC",
  yaneHari: "#6E7278", // 梁
  keikou: "#FFF6DC", // 屋根の下の蛍光灯
  hashira: "#D8D4C8", // 柱
  asphalt: "#3A3833",
  asphaltLit: "#565249",
  abura: "#1C1A16", // アスファルトの油染み
  aburaSheen: "#4E5A4A", // 油膜の虹色の照り
  hakusen: "#D8D2BE", // 白線
  kanban: "#F2EDE1", // 価格看板の地
  kanbanWaku: "#1E3A6E", // 看板の枠 (紺)
  suuji: "#1E2328", // 価格の数字 (黒地の反転幕)
  suujiBg: "#14171A",
  suujiLit: "#F6F2E2",
  regular: "#D83A2A", // レギュラー=赤
  haioku: "#F0B21E", // ハイオク=黄
  keiyu: "#2E7D4E", // 軽油=緑
  keiryoki: "#E2DED2", // 計量機
  keiryokiKage: "#B8B4A6",
  ekisho: "#1A2A24", // 液晶
  ekishoLit: "#7EE8B0",
  hose: "#1E1C1A", // 給油ホース
  nozzle: "#D83A2A",
  kuruma: "#DCDEE0", // 国産の軽自動車 (白)
  kurumaKage: "#A8ACB0",
  kurumaMado: "#415A6E",
  tire: "#1C1C1E",
  nobori: "#D83A2A", // 幟
  noboriShiro: "#F2EDE1",
  seifuku: "#1E3A6E", // 店員の制服 (紺)
  seifukuLit: "#39598E",
  cap: "#D83A2A",
  shirt: "#9EB4C8", // 仕事帰りのシャツ (水色)
  shirtKage: "#6E86A0",
  nekutai: "#3A4A64",
  hada: WP.skin,
  hadaKage: WP.skinShade,
  kami: "#241E1A",
  receipt: "#F6F2E6",
  line: "#171310",
};

const S39: SekaiArt = ({ f }) => {
  const uid = "d39";
  // 事件: 価格表示の数字がカタンと1つ上がる
  const tick = easeOut(seg(f, 44, 52));
  const shift = -tick * 62; // 数字の幕が1つぶん送られる
  const clack = Math.max(0, 1 - Math.abs(f - 48) / 5) ** 2;
  const look = easeOut(seg(f, 12, 34)); // 看板を見上げる
  const nobori = Math.sin(f / 8);
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D39.skyHi} />
          <stop offset="46%" stopColor={D39.skyMid} />
          <stop offset="100%" stopColor={D39.skyLow} />
        </linearGradient>
        <linearGradient id={`${uid}-asph`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D39.asphaltLit} />
          <stop offset="100%" stopColor={D39.asphalt} />
        </linearGradient>
        <radialGradient id={`${uid}-keikou`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={D39.keikou} stopOpacity={0.3} />
          <stop offset="100%" stopColor={D39.keikou} stopOpacity={0} />
        </radialGradient>
      </defs>
      <Cam f={f} from={[12, 18, 1.04]} to={[-10, -10, 1.0]} start={0} end={88}>
        {/* 夕方の空 */}
        <rect x={-200} y={-200} width={W + 400} height={880} fill={`url(#${uid}-sky)`} />
        {[
          [300, 240, 300, 34],
          [900, 180, 420, 28],
          [1560, 290, 340, 30],
        ].map(([cx, cy, cw, ch], i) => (
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx={cw} ry={ch} fill={D39.cloud} opacity={0.5} />
            <ellipse cx={(cx as number) - 40} cy={(cy as number) + 14} rx={(cw as number) * 0.7} ry={(ch as number) * 0.8} fill={D39.cloudShade} opacity={0.34} />
          </g>
        ))}
        {/* 遠くの町並み */}
        {[
          [-120, 520, 260, 130],
          [170, 548, 190, 100],
          [380, 506, 210, 144],
          [620, 540, 170, 108],
          [1480, 520, 220, 128],
          [1720, 544, 240, 106],
        ].map(([bx, by, bw, bh], i) => (
          <g key={i}>
            <rect x={bx} y={by} width={bw} height={bh} fill="#4A4254" />
            {Array.from({ length: 6 }, (_, k) => (
              <rect
                key={k}
                x={(bx as number) + 14 + (k % 3) * (((bw as number) - 40) / 3)}
                y={(by as number) + 18 + Math.floor(k / 3) * 46}
                width={24}
                height={28}
                fill={(i + k) % 3 === 0 ? "#F0C070" : "#2E2A3A"}
                opacity={0.85}
              />
            ))}
          </g>
        ))}
        {/* 価格看板。レギュラー / ハイオク / 軽油の3段 */}
        <g>
          <rect x={1176} y={598} width={34} height={320} fill={D39.yaneHari} />
          <rect x={1372} y={598} width={34} height={320} fill={D39.yaneHari} />
          <rect x={1096} y={122} width={520} height={492} rx={10} fill={D39.kanbanWaku} stroke={D39.line} strokeWidth={6} />
          <rect x={1120} y={146} width={472} height={444} rx={6} fill={D39.kanban} />
          <text x={1356} y={210} fontFamily={SEKAI_SERIF} fontSize={42} fontWeight={700} fill={D39.kanbanWaku} textAnchor="middle">
            本日の価格
          </text>
          <line x1={1140} y1={228} x2={1572} y2={228} stroke={D39.kanbanWaku} strokeWidth={5} />
          {[
            ["レギュラー", D39.regular, 170, 0],
            ["ハイオク", D39.haioku, 181, 1],
            ["軽　油", D39.keiyu, 149, 2],
          ].map(([name, c, price, row]) => {
            const ry = 268 + (row as number) * 112;
            const digits = String(price).split("");
            return (
              <g key={name as string}>
                <rect x={1140} y={ry - 42} width={170} height={84} rx={5} fill={c as string} />
                <text
                  x={1225}
                  y={ry + 10}
                  fontFamily={SEKAI_SERIF}
                  fontSize={30}
                  fontWeight={700}
                  fill="#FFFFFF"
                  textAnchor="middle"
                >
                  {name as string}
                </text>
                {/* 数字は黒地の幕。レギュラーだけ1つ上がる */}
                <rect x={1326} y={ry - 44} width={198} height={88} rx={4} fill={D39.suujiBg} />
                <g clipPath={`url(#${uid}-clip${row})`}>
                  <g transform={`translate(0 ${row === 0 ? shift : 0})`}>
                    {digits.map((d, k) => (
                      <text
                        key={k}
                        x={1356 + k * 58}
                        y={ry + 20}
                        fontFamily={SEKAI_FONT}
                        fontSize={70}
                        fontWeight={700}
                        fill={D39.suujiLit}
                        textAnchor="middle"
                      >
                        {d}
                      </text>
                    ))}
                    {/* 送られてくる次の数字 (171) */}
                    {row === 0 &&
                      "171".split("").map((d, k) => (
                        <text
                          key={`n${k}`}
                          x={1356 + k * 58}
                          y={ry + 82}
                          fontFamily={SEKAI_FONT}
                          fontSize={70}
                          fontWeight={700}
                          fill={D39.suujiLit}
                          textAnchor="middle"
                        >
                          {d}
                        </text>
                      ))}
                  </g>
                </g>
                <defs>
                  <clipPath id={`${uid}-clip${row}`}>
                    <rect x={1326} y={ry - 44} width={198} height={88} />
                  </clipPath>
                </defs>
                <text x={1548} y={ry + 16} fontFamily={SEKAI_SERIF} fontSize={34} fill={D39.kanbanWaku} textAnchor="middle">
                  円
                </text>
              </g>
            );
          })}
          {/* カタンと鳴った瞬間の光 */}
          {clack > 0 && <rect x={1326} y={224} width={198} height={88} fill="#FFFFFF" opacity={0.5 * clack} />}
        </g>
        {/* 屋根 (キャノピー) */}
        <g>
          <rect x={-200} y={372} width={1180} height={78} fill={D39.yane} stroke={D39.line} strokeWidth={5} />
          <rect x={-200} y={450} width={1180} height={26} fill={D39.yaneKage} />
          <rect x={-200} y={356} width={1180} height={20} fill={D39.regular} />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={-40 + i * 220} y={476} width={54} height={28} rx={5} fill={D39.yaneHari} />
              <rect x={-24 + i * 220} y={500} width={22} height={300} fill={D39.hashira} stroke={D39.line} strokeWidth={4} />
            </g>
          ))}
          {/* 蛍光灯 */}
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={60 + i * 250} y={458} width={180} height={16} rx={6} fill={D39.keikou} />
              <ellipse cx={150 + i * 250} cy={470} rx={190} ry={76} fill={`url(#${uid}-keikou)`} />
            </g>
          ))}
        </g>
        {/* 幟 */}
        {[
          [68, 540],
          [1800, 560],
        ].map(([px, py], i) => (
          <g key={i}>
            <rect x={px} y={py} width={9} height={400} fill={D39.yaneHari} />
            <path
              d={`M${(px as number) + 9} ${py} q${26 + nobori * 10} 60 ${-6 + nobori * 4} 120 q${-20 + nobori * 12} 60 ${10} 124 L${
                (px as number) + 9
              } ${(py as number) + 244} Z`}
              fill={D39.nobori}
              stroke={D39.line}
              strokeWidth={3}
            />
            <text
              x={(px as number) + 42}
              y={(py as number) + 70}
              fontFamily={SEKAI_SERIF}
              fontSize={30}
              fontWeight={700}
              fill={D39.noboriShiro}
              textAnchor="middle"
            >
              セ
            </text>
            <text
              x={(px as number) + 38}
              y={(py as number) + 136}
              fontFamily={SEKAI_SERIF}
              fontSize={30}
              fontWeight={700}
              fill={D39.noboriShiro}
              textAnchor="middle"
            >
              ル
            </text>
            <text
              x={(px as number) + 44}
              y={(py as number) + 202}
              fontFamily={SEKAI_SERIF}
              fontSize={30}
              fontWeight={700}
              fill={D39.noboriShiro}
              textAnchor="middle"
            >
              フ
            </text>
          </g>
        ))}
        {/* アスファルトと白線・油染み */}
        <rect x={-200} y={790} width={W + 400} height={400} fill={`url(#${uid}-asph)`} />
        <path d="M-200 866 L2120 846" stroke={D39.hakusen} strokeWidth={9} opacity={0.65} />
        {[
          [540, 962, 150, 46],
          [880, 1012, 190, 54],
          [1380, 944, 130, 40],
        ].map(([ox, oy, ow, oh], i) => (
          <g key={i}>
            <ellipse cx={ox} cy={oy} rx={ow} ry={oh} fill={D39.abura} opacity={0.72} />
            <ellipse cx={(ox as number) - 24} cy={(oy as number) - 10} rx={(ow as number) * 0.5} ry={(oh as number) * 0.5} fill={D39.aburaSheen} opacity={0.3} />
          </g>
        ))}
        {/* 国産の軽自動車 */}
        <g transform="translate(1178 834)">
          <ellipse cx={0} cy={126} rx={330} ry={28} fill={D39.line} opacity={0.34} />
          {/* 車体 (背の高い軽) */}
          <path
            d="M-300 110 L-300 -10 Q-294 -96 -214 -140 L170 -148 Q268 -118 290 -16 L296 110 Z"
            fill={D39.kuruma}
            stroke={D39.line}
            strokeWidth={5}
          />
          <path d="M-300 44 L296 40" stroke={D39.kurumaKage} strokeWidth={9} opacity={0.8} />
          {/* 窓 */}
          <path d="M-250 -14 Q-246 -92 -186 -118 L-20 -124 L-20 -14 Z" fill={D39.kurumaMado} stroke={D39.line} strokeWidth={4} />
          <path d="M0 -124 L156 -128 Q226 -104 244 -18 L0 -14 Z" fill={D39.kurumaMado} stroke={D39.line} strokeWidth={4} />
          <path d="M-240 -40 Q-200 -98 -150 -112" fill="none" stroke="#9EC0D4" strokeWidth={7} opacity={0.6} />
          {/* 後部座席の子ども。窓からこちらを見ている */}
          <g transform="translate(-130 -64)">
            <circle cx={0} cy={0} r={38} fill={D39.hada} stroke={D39.line} strokeWidth={4} />
            <path d="M-38 -8 Q-36 -46 0 -46 Q36 -46 38 -8 Q20 -28 0 -26 Q-20 -28 -38 -8 Z" fill={D39.kami} />
            <ellipse cx={-14} cy={2} rx={8} ry={9} fill="#F4F1EA" stroke={D39.line} strokeWidth={2.4} />
            <ellipse cx={14} cy={2} rx={8} ry={9} fill="#F4F1EA" stroke={D39.line} strokeWidth={2.4} />
            <circle cx={-13} cy={3} r={4.4} fill={D39.line} />
            <circle cx={15} cy={3} r={4.4} fill={D39.line} />
            <circle cx={-11.4} cy={1} r={1.6} fill="#FFFFFF" />
            <circle cx={16.6} cy={1} r={1.6} fill="#FFFFFF" />
            <path d="M-24 -12 Q-14 -18 -6 -12" fill="none" stroke={D39.line} strokeWidth={3} strokeLinecap="round" />
            <path d="M6 -12 Q14 -18 24 -12" fill="none" stroke={D39.line} strokeWidth={3} strokeLinecap="round" />
            <path d="M1 8 Q-3 16 2 18" fill="none" stroke={D39.line} strokeWidth={2.4} />
            <path d="M-11 26 Q0 32 11 26" fill="none" stroke={D39.line} strokeWidth={3} strokeLinecap="round" />
            {/* 窓に当てた手 */}
            <path d="M34 22 Q58 12 66 32 Q70 52 46 56 Q26 58 24 40 Z" fill={D39.hada} stroke={D39.line} strokeWidth={3.4} />
          </g>
          {/* 給油口 */}
          <circle cx={222} cy={16} r={30} fill={D39.kurumaKage} stroke={D39.line} strokeWidth={4} />
          <circle cx={222} cy={16} r={16} fill="#6E7278" />
          {/* 灯火とナンバー */}
          <rect x={248} y={-4} width={44} height={26} rx={5} fill="#E85A3A" stroke={D39.line} strokeWidth={3} />
          <rect x={-300} y={-6} width={34} height={28} rx={5} fill="#F0D88E" stroke={D39.line} strokeWidth={3} />
          <rect x={-70} y={66} width={140} height={34} rx={4} fill="#F2EDE1" stroke={D39.line} strokeWidth={3} />
          <text x={0} y={92} fontFamily={SEKAI_FONT} fontSize={24} fill={D39.line} textAnchor="middle">
            ・・ 12
          </text>
          {/* タイヤ */}
          {[-196, 196].map((tx) => (
            <g key={tx}>
              <circle cx={tx} cy={116} r={52} fill={D39.tire} stroke={D39.line} strokeWidth={4} />
              <circle cx={tx} cy={116} r={22} fill="#8E949A" stroke={D39.line} strokeWidth={3} />
            </g>
          ))}
        </g>
        {/* 計量機とホース */}
        <g transform="translate(508 536)">
          <rect x={-104} y={0} width={208} height={372} rx={10} fill={D39.keiryoki} stroke={D39.line} strokeWidth={5} />
          <rect x={-104} y={0} width={208} height={54} rx={10} fill={D39.regular} />
          <rect x={-80} y={78} width={160} height={120} rx={6} fill={D39.ekisho} stroke={D39.line} strokeWidth={4} />
          <text x={66} y={128} fontFamily={SEKAI_FONT} fontSize={34} fill={D39.ekishoLit} textAnchor="end">
            {Math.min(30, Math.floor(f * 0.6))}.00
          </text>
          <text x={66} y={172} fontFamily={SEKAI_FONT} fontSize={30} fill={D39.ekishoLit} textAnchor="end">
            {Math.min(5100, Math.floor(f * 102))}
          </text>
          <text x={-68} y={128} fontFamily={SEKAI_FONT} fontSize={18} fill={D39.ekishoLit}>
            L
          </text>
          <text x={-68} y={172} fontFamily={SEKAI_FONT} fontSize={18} fill={D39.ekishoLit}>
            円
          </text>
          <rect x={-80} y={216} width={160} height={54} rx={5} fill={D39.keiryokiKage} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-70 + i * 54} y={226} width={40} height={34} rx={4} fill={i === 0 ? D39.regular : i === 1 ? D39.haioku : D39.keiyu} />
          ))}
          <rect x={-104} y={300} width={208} height={14} fill={D39.keiryokiKage} />
          {/* ノズル掛け */}
          <rect x={92} y={120} width={44} height={26} rx={5} fill={D39.keiryokiKage} stroke={D39.line} strokeWidth={3} />
        </g>
        {/* 給油ホースとノズル。車の給油口へ伸びる */}
        <path
          d="M612 666 Q760 804 920 790 Q1120 772 1380 850"
          fill="none"
          stroke={D39.hose}
          strokeWidth={22}
          strokeLinecap="round"
        />
        <path
          d="M612 666 Q760 804 920 790 Q1120 772 1380 850"
          fill="none"
          stroke="#3A3834"
          strokeWidth={7}
          opacity={0.6}
        />
        <g transform="translate(1392 852) rotate(14)">
          <rect x={-46} y={-20} width={92} height={40} rx={10} fill={D39.nozzle} stroke={D39.line} strokeWidth={4} />
          <rect x={40} y={-10} width={76} height={20} rx={8} fill="#8E949A" stroke={D39.line} strokeWidth={3.4} />
          <path d="M-30 20 L-18 50 L18 50 L26 20 Z" fill="#4A4E52" stroke={D39.line} strokeWidth={3.4} />
        </g>
        {/* 20代の女性スタッフ。レシートを渡す */}
        <g transform="translate(916 700) scale(0.96)">
          <path d="M-54 380 L-54 170 L-18 170 L-20 380 Z" fill="#2E3540" stroke={D39.line} strokeWidth={4} />
          <path d="M14 380 L12 170 L50 170 L50 380 Z" fill="#2E3540" stroke={D39.line} strokeWidth={4} />
          <rect x={-58} y={372} width={46} height={18} rx={5} fill="#1A1C20" />
          <rect x={10} y={372} width={46} height={18} rx={5} fill="#1A1C20" />
          <path d="M-70 174 Q-80 50 -62 -24 L62 -24 Q80 50 70 174 Z" fill={D39.seifuku} stroke={D39.line} strokeWidth={4.4} />
          <path d="M-30 -24 L-22 110 M30 -24 L22 110" stroke={D39.seifukuLit} strokeWidth={6} opacity={0.7} />
          <rect x={-70} y={96} width={140} height={22} fill="#D8D4C8" />
          {/* 腕を伸ばしてレシートを渡す */}
          <path d="M60 -16 Q140 40 198 86" fill="none" stroke={D39.seifuku} strokeWidth={30} strokeLinecap="round" />
          <circle cx={206} cy={92} r={17} fill={D39.hada} stroke={D39.line} strokeWidth={3.4} />
          <g transform="translate(222 98) rotate(22)">
            <rect x={0} y={-34} width={44} height={74} rx={3} fill={D39.receipt} stroke={D39.line} strokeWidth={3} />
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={6} y1={-22 + i * 14} x2={38} y2={-22 + i * 14} stroke="#A8A292" strokeWidth={2.4} />
            ))}
          </g>
          <path d="M-62 -16 Q-96 54 -86 132" fill="none" stroke={D39.seifuku} strokeWidth={28} strokeLinecap="round" />
          <circle cx={-86} cy={142} r={16} fill={D39.hada} stroke={D39.line} strokeWidth={3.4} />
          {/* 首と顔 */}
          <rect x={-16} y={-46} width={32} height={26} fill={D39.hadaKage} />
          <ellipse cx={0} cy={-96} rx={50} ry={56} fill={D39.hada} stroke={D39.line} strokeWidth={4.4} />
          <ellipse cx={-50} cy={-92} rx={8} ry={12} fill={D39.hada} stroke={D39.line} strokeWidth={3} />
          <ellipse cx={50} cy={-92} rx={8} ry={12} fill={D39.hada} stroke={D39.line} strokeWidth={3} />
          {/* 後ろでまとめた髪 */}
          <path d="M-50 -104 Q-46 -152 0 -152 Q46 -152 50 -104 Q28 -128 0 -126 Q-28 -128 -50 -104 Z" fill={D39.kami} />
          <path d="M44 -112 Q74 -96 66 -52 Q58 -22 40 -24 Q58 -72 44 -112 Z" fill={D39.kami} />
          {/* 制服のキャップ */}
          <path d="M-54 -124 Q-50 -168 0 -170 Q50 -168 54 -124 Z" fill={D39.cap} stroke={D39.line} strokeWidth={4} />
          <path d="M-56 -124 L-96 -116 L-96 -104 L-50 -116 Z" fill={D39.cap} stroke={D39.line} strokeWidth={3.4} />
          {/* 顔 */}
          <path d="M-32 -112 Q-22 -120 -12 -112" fill="none" stroke={D39.line} strokeWidth={3.4} strokeLinecap="round" />
          <path d="M12 -112 Q22 -120 32 -112" fill="none" stroke={D39.line} strokeWidth={3.4} strokeLinecap="round" />
          <ellipse cx={-20} cy={-96} rx={11} ry={9} fill="#F4F1EA" stroke={D39.line} strokeWidth={2.6} />
          <ellipse cx={20} cy={-96} rx={11} ry={9} fill="#F4F1EA" stroke={D39.line} strokeWidth={2.6} />
          <circle cx={-19} cy={-96} r={5} fill={D39.line} />
          <circle cx={21} cy={-96} r={5} fill={D39.line} />
          <circle cx={-17} cy={-98} r={1.8} fill="#FFFFFF" />
          <circle cx={23} cy={-98} r={1.8} fill="#FFFFFF" />
          <path d="M1 -88 Q-5 -76 3 -72" fill="none" stroke={D39.line} strokeWidth={2.6} />
          <path d="M-14 -62 Q0 -52 14 -62" fill="none" stroke={D39.line} strokeWidth={3.4} strokeLinecap="round" />
        </g>
        {/* 40代の男性。給油しながら価格看板を見上げる。顔が画面の高さの1/4以上 */}
        <g transform="translate(596 612)">
          {/* 肩 */}
          <path d="M-330 540 Q-312 300 -176 232 L166 232 Q310 302 326 540 Z" fill={D39.shirt} stroke={D39.line} strokeWidth={6} />
          <path d="M-176 232 Q-70 320 10 300 L28 540 L-70 540 Z" fill="#B8CCDC" opacity={0.7} />
          {/* 襟 */}
          <path d="M-96 234 L-16 318 L-134 300 Z" fill="#E6EEF4" stroke={D39.line} strokeWidth={5} />
          <path d="M94 234 L18 318 L136 302 Z" fill="#E6EEF4" stroke={D39.line} strokeWidth={5} />
          <path d="M-16 318 L18 318 L34 540 L-34 540 Z" fill={D39.nekutai} stroke={D39.line} strokeWidth={4} />
          {/* 胸ポケットと社員証 */}
          <rect x={150} y={372} width={104} height={92} rx={5} fill={D39.shirtKage} opacity={0.5} stroke={D39.line} strokeWidth={4} />
          <rect x={170} y={346} width={62} height={44} rx={4} fill="#F2EDE1" stroke={D39.line} strokeWidth={3.4} />
          {/* 首 */}
          <path d="M-62 150 L62 150 L68 240 L-68 240 Z" fill={D39.hadaKage} />
          <path d="M-62 150 L62 150 L66 196 L-66 196 Z" fill={D39.hada} />
          {/* 顔。見上げているので少し上向き */}
          <g transform={`rotate(${-6 - look * 7} 0 150)`}>
            <ellipse cx={0} cy={-6} rx={126} ry={156} fill={D39.hada} stroke={D39.line} strokeWidth={6} />
            <ellipse cx={-126} cy={0} rx={18} ry={32} fill={D39.hada} stroke={D39.line} strokeWidth={5} />
            <ellipse cx={126} cy={0} rx={18} ry={32} fill={D39.hada} stroke={D39.line} strokeWidth={5} />
            {/* 短い髪。生え際が上がっている */}
            <path
              d="M-126 -32 Q-120 -164 0 -170 Q120 -164 126 -32 Q108 -96 56 -106 Q0 -116 -56 -104 Q-106 -94 -126 -32 Z"
              fill={D39.kami}
            />
            <path d="M-92 -96 Q-30 -132 44 -118" fill="none" stroke="#3A322C" strokeWidth={8} opacity={0.7} />
            {/* 眉 (少し寄っている) */}
            <path d="M-92 -38 Q-56 -58 -20 -42" fill="none" stroke={D39.kami} strokeWidth={14} strokeLinecap="round" />
            <path d="M20 -42 Q56 -58 92 -38" fill="none" stroke={D39.kami} strokeWidth={14} strokeLinecap="round" />
            {/* 目。看板を見上げている */}
            <ellipse cx={-56} cy={-2} rx={34} ry={25} fill="#F4F1EA" stroke={D39.line} strokeWidth={5} />
            <ellipse cx={56} cy={-2} rx={34} ry={25} fill="#F4F1EA" stroke={D39.line} strokeWidth={5} />
            <circle cx={-50} cy={-8} r={15} fill="#2A2420" />
            <circle cx={62} cy={-8} r={15} fill="#2A2420" />
            <circle cx={-45} cy={-13} r={5} fill="#FFFFFF" />
            <circle cx={67} cy={-13} r={5} fill="#FFFFFF" />
            {/* 下まつげ側の皺 */}
            <path d="M-86 20 Q-56 30 -26 20" fill="none" stroke={D39.hadaKage} strokeWidth={4.4} />
            <path d="M26 20 Q56 30 86 20" fill="none" stroke={D39.hadaKage} strokeWidth={4.4} />
            {/* 鼻 */}
            <path d="M4 18 Q-18 76 6 90" fill="none" stroke={D39.line} strokeWidth={6} strokeLinecap="round" />
            <path d="M6 90 Q28 86 32 70" fill="none" stroke={D39.hadaKage} strokeWidth={5} />
            {/* 口。少し開いて「また上がったのか」の顔 */}
            <path d="M-34 120 Q0 108 36 120 Q0 142 -34 120 Z" fill="#6E3630" stroke={D39.line} strokeWidth={5} />
            <path d="M-50 112 L-62 134 M52 112 L64 134" stroke={D39.hadaKage} strokeWidth={4.4} strokeLinecap="round" />
            {/* 無精髭の影 */}
            <path d="M-96 66 Q-60 150 0 158 Q60 150 96 66 Q58 118 0 122 Q-58 118 -96 66 Z" fill={D39.hadaKage} opacity={0.22} />
          </g>
          {/* ノズルを握る腕 (画面の下から出てホースへ) */}
          <path d="M240 420 Q360 472 452 520" fill="none" stroke={D39.shirt} strokeWidth={62} strokeLinecap="round" />
          <path d="M240 420 Q360 472 452 520" fill="none" stroke={D39.line} strokeWidth={5} opacity={0.3} />
          <circle cx={470} cy={530} r={34} fill={D39.hada} stroke={D39.line} strokeWidth={5} />
        </g>
        {/* 札 */}
        <Fuda x={330} y={198} text="日本 夕方" t={easeOut(seg(f, 8, 26))} size={28} tone={WP.alert} />
        <Fuda x={1356} y={968} text="補助金で一七〇円前後" t={easeOut(seg(f, 54, 72))} size={32} tone={WP.alert} />
      </Cam>
      <YearTag year="二〇二六" place="日本" f={f} />
    </>
  );
};

export const GROUP_D: Record<string, SekaiArt> = {
  sekai_31: S31,
  sekai_32: S32,
  sekai_33: S33,
  sekai_34: S34,
  sekai_35: S35,
  sekai_36: S36,
  sekai_37: S37,
  sekai_38: S38,
  sekai_39: S39,
};
