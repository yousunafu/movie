// 「最初の自動販売機は、何を売っていたのか」のサムネ 4パターン (1280×720)。本編とは無関係。
// 本編の部品を流用: HolyPot (神殿の聖水の壺) / TempleBG / AncientPerson / Jihanki / メインキャラ Person
// ★答え「聖水」はサムネに出さない (タイトルが問いなので)。オチ「売らないこと」も出さない
// 型は ThumbKit.tsx の並び (P1 どアップ / P2 対比 / P3 ミニマル / P4 物語+ワイプ)

import React from "react";
import { KRP, Person, Jihanki } from "./KarakuriScenes";
import { HolyPot, TempleBG, AncientPerson } from "./Jihanki2000Scenes";
import { TW, TH, INK, FONT, MINCHO, P, Big, Burst, Wipe, makeThumb, makeThumbSheet, makeThumbFeed } from "./ThumbKit";

// 落ちてくるコイン
const Coin: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 34 }) => (
  <g>
    {[0, 1, 2].map((i) => (
      <line key={i} x1={x - 18 + i * 18} y1={y - r - 70} x2={x - 18 + i * 18} y2={y - r - 22} stroke={INK} strokeWidth={6} strokeLinecap="round" />
    ))}
    <ellipse cx={x} cy={y} rx={r} ry={r * 0.92} fill={KRP.gold} stroke={INK} strokeWidth={6} />
    <ellipse cx={x} cy={y} rx={r * 0.62} ry={r * 0.56} fill="none" stroke="#B89A3E" strokeWidth={4} />
  </g>
);

// 夜の自販機 (窓あかりつき)。x,y = 左上
const LitJihanki: React.FC<{ id: string; x: number; y: number; s: number }> = ({ id, x, y, s }) => (
  <g>
    <defs>
      <radialGradient id={id}>
        <stop offset="0%" stopColor="#FFE9A8" stopOpacity={0.55} />
        <stop offset="55%" stopColor="#FFD970" stopOpacity={0.18} />
        <stop offset="100%" stopColor="#FFD970" stopOpacity={0} />
      </radialGradient>
    </defs>
    <ellipse cx={x + 180 * s} cy={y + 300 * s} rx={520 * s} ry={470 * s} fill={`url(#${id})`} />
    <ellipse cx={x + 180 * s} cy={y + 628 * s} rx={330 * s} ry={40 * s} fill="#FFE9A8" opacity={0.25} />
    <Jihanki x={x} y={y} s={s} f={0} />
  </g>
);

// ===== P1: どアップ・リアクション =====
const P1: React.FC = () => (
  <g>
    <Burst cx={600} cy={470} a="#FFD84D" b="#FFC21F" />
    <HolyPot x={600} y={712} s={1.25} />
    <Coin x={600} y={128} />
    <Big x={712} y={150} size={58} text="チャリン" fill={KRP.white} sw={12} rot={10} />
    <Person x={1085} y={930} s={1.8} face="surprised" gaze={[-3, -1]} still />
    <Big x={1185} y={300} size={120} text="!?" anchor="middle" fill={KRP.red} sw={16} />
    <Big x={48} y={112} size={76} text="2000年前の" fill={KRP.red} stroke={KRP.white} sw={14} />
    <Big x={40} y={272} size={170} text="自販機" fill={KRP.white} sw={26} />
  </g>
);

// ===== P2: ビフォーアフター対比 =====
// 土台 (壺・自販機・境目・ラベル)。文字の見せ方だけを変えた別案 (P2a〜d) と共有する
const P2Base: React.FC = () => (
  <g>
    {/* 左: 2000年前の神殿 */}
    <g transform="scale(0.6667)"><TempleBG y={980} /></g>
    <HolyPot x={240} y={672} s={1.0} />
    {/* 右: いまの夜道 */}
    <polygon points={`760,0 ${TW},0 ${TW},${TH} 520,${TH}`} fill="#1B2236" />
    {Array.from({ length: 14 }).map((_, i) => (
      <circle key={i} cx={700 + ((i * 137) % 560)} cy={30 + ((i * 89) % 260)} r={i % 3 === 0 ? 4 : 2.5} fill="#FFF3C4" opacity={0.8} />
    ))}
    <rect x={520} y={660} width={TW - 520} height={60} fill="#2A3148" />
    <LitJihanki id="jhGlow2" x={900} y={210} s={0.74} />
    {/* 斜めの境目 */}
    <polygon points="640,0 760,0 520,720 400,720" fill={KRP.white} stroke={INK} strokeWidth={6} />
    {/* ラベル */}
    <rect x={34} y={34} width={330} height={92} rx={18} fill={INK} />
    <text x={199} y={102} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={KRP.white}>2000年前</text>
    <rect x={1060} y={34} width={186} height={92} rx={18} fill={KRP.white} />
    <text x={1153} y={102} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill={INK}>いま</text>
  </g>
);
const P2Face: React.FC = () => (
  <g>
    {/* 境目の下からのぞく、驚いたメインキャラ (顔だけ) */}
    <Person x={600} y={612 + 228 * 1.3} s={1.3} face="surprised" gaze={[0, -2]} still />
    <Big x={712} y={566} size={72} text="!?" fill={KRP.red} sw={12} rot={8} />
  </g>
);
const P2: React.FC = () => (
  <g>
    <P2Base />
    {/* まんなかの問い */}
    <circle cx={590} cy={320} r={168} fill={KRP.yellow} stroke={INK} strokeWidth={10} />
    <Big x={590} y={306} size={86} text="同じ" anchor="middle" fill={INK} sw={0} />
    <Big x={590} y={402} size={70} text="仕組み？" anchor="middle" fill={KRP.red} sw={0} />
    <P2Face />
  </g>
);

// ---- 「同じ仕組み？」の文字の見せ方を派手にした別案 ----
// 立体文字 (奥行きを ink で重ねてから表面を塗る)
const Extrude: React.FC<{
  x: number; y: number; size: number; text: string; face: string; side: string; depth?: number; rot?: number;
}> = ({ x, y, size, text, face, side, depth = 16, rot = 0 }) => (
  <g transform={`rotate(${rot} ${x} ${y})`}>
    {Array.from({ length: depth }).map((_, i) => (
      <text key={i} x={x + depth - i} y={y + depth - i} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size}
        fill={side} stroke={i === 0 ? INK : side} strokeWidth={i === 0 ? 24 : 10} strokeLinejoin="round" paintOrder="stroke">{text}</text>
    ))}
    <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size}
      fill={face} stroke={INK} strokeWidth={12} strokeLinejoin="round" paintOrder="stroke">{text}</text>
  </g>
);

// a: 立体文字 (黄色の面に赤い側面・斜め)
const P2a: React.FC = () => (
  <g>
    <P2Base />
    <P2Face />
    <Extrude x={600} y={300} size={150} text="同じ" face={KRP.yellow} side={KRP.red} rot={-8} />
    <Extrude x={610} y={450} size={112} text="仕組み？" face={KRP.white} side={KRP.red} depth={14} rot={-8} />
  </g>
);

// b: 爆発フキダシ (ギザギザの中に白抜きの太文字)
const Explosion: React.FC<{ cx: number; cy: number; r: number; spikes?: number; fill: string; inner?: number }> = ({ cx, cy, r, spikes = 18, fill, inner = 0.72 }) => {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r * (0.94 + ((i * 37) % 7) / 60) : r * inner;
    pts.push(`${(cx + Math.cos(a) * rr * 1.25).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return <polygon points={pts.join(" ")} fill={fill} stroke={INK} strokeWidth={9} strokeLinejoin="round" />;
};
const P2b: React.FC = () => (
  <g>
    <P2Base />
    <P2Face />
    <Explosion cx={600} cy={286} r={214} fill={KRP.red} />
    <Explosion cx={600} cy={286} r={176} fill={KRP.yellow} spikes={16} inner={0.8} />
    <Big x={600} y={272} size={114} text="同じ" anchor="middle" fill={KRP.white} sw={21} rot={-5} />
    <Big x={605} y={380} size={82} text="仕組み？" anchor="middle" fill={KRP.red} stroke={KRP.white} sw={15} rot={-5} />
  </g>
);

// c: テレビのテロップ風 (金のグラデーション+白と黒の二重ふち+光)
const P2c: React.FC = () => (
  <g>
    <P2Base />
    <P2Face />
    <defs>
      <linearGradient id="jhGold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFF6B0" />
        <stop offset="48%" stopColor="#FFD23A" />
        <stop offset="52%" stopColor="#F0A41C" />
        <stop offset="100%" stopColor="#FFE27A" />
      </linearGradient>
      <filter id="jhGlow" x="-20%" y="-40%" width="140%" height="180%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
    </defs>
    <text x={600} y={276} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150} fill="#FFE27A" opacity={0.9} filter="url(#jhGlow)">同じ</text>
    <text x={600} y={276} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150} fill="none" stroke={INK} strokeWidth={34} strokeLinejoin="round">同じ</text>
    <text x={600} y={276} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150} fill="none" stroke={KRP.white} strokeWidth={18} strokeLinejoin="round">同じ</text>
    <text x={600} y={276} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150} fill="url(#jhGold)">同じ</text>
    <text x={600} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={116} fill="#FFE27A" opacity={0.9} filter="url(#jhGlow)">仕組み？</text>
    <text x={600} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={116} fill="none" stroke={INK} strokeWidth={34} strokeLinejoin="round">仕組み？</text>
    <text x={600} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={116} fill="none" stroke={KRP.white} strokeWidth={18} strokeLinejoin="round">仕組み？</text>
    <text x={600} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={116} fill="url(#jhGold)">仕組み？</text>
  </g>
);

// d: 1文字ずつ色ちがいのタイルに乗せて、ばらばらに傾ける (ポップ)
const P2d: React.FC = () => {
  const chars = ["同", "じ", "仕", "組", "み", "？"];
  const cols = [KRP.red, KRP.orange, KRP.yellow, KRP.green, KRP.blueDeep, "#E0607E"];
  const rots = [-10, 6, -4, 9, -7, 12];
  const dy = [0, 18, -10, 14, -6, 20];
  return (
    <g>
      <P2Base />
      <P2Face />
      {chars.map((c, i) => {
        const row = i < 2 ? 0 : 1;
        const col = row === 0 ? i : i - 2;
        const n = row === 0 ? 2 : 4;
        const x = 600 + (col - (n - 1) / 2) * 132 + (row === 0 ? -20 : 10);
        const y = (row === 0 ? 230 : 380) + dy[i] * 0.6;
        const k = 0.86;
        return (
          <g key={i} transform={`rotate(${rots[i]} ${x} ${y}) translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`}>
            <rect x={x - 70 + 8} y={y - 70 + 10} width={140} height={140} rx={22} fill={INK} />
            <rect x={x - 70} y={y - 70} width={140} height={140} rx={22} fill={cols[i]} stroke={INK} strokeWidth={8} />
            <text x={x} y={y + 38} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={108}
              fill={KRP.white} stroke={INK} strokeWidth={10} strokeLinejoin="round" paintOrder="stroke">{c}</text>
          </g>
        );
      })}
    </g>
  );
};

// ===== P3: ミニマル余白 (夜・静か) =====
const P3: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="jhNight" cx="72%" cy="45%" r="70%">
        <stop offset="0%" stopColor="#2A3350" />
        <stop offset="100%" stopColor="#0C0F18" />
      </radialGradient>
    </defs>
    <rect width={TW} height={TH} fill="url(#jhNight)" />
    <rect y={640} width={TW} height={80} fill="#151A28" />
    <LitJihanki id="jhGlow3" x={850} y={170} s={0.76} />
    <text x={90} y={300} fontFamily={MINCHO} fontWeight={600} fontSize={86} fill="#F4EEDF" letterSpacing={4}>最初の一台は、</text>
    <text x={90} y={420} fontFamily={MINCHO} fontWeight={600} fontSize={86} fill="#F4EEDF" letterSpacing={4}>神殿にあった。</text>
    <line x1={94} y1={474} x2={414} y2={474} stroke={KRP.brass} strokeWidth={3} />
    <text x={94} y={526} fontFamily={MINCHO} fontSize={36} fill={KRP.brass} letterSpacing={4}>2000年前の、コイン仕掛け</text>
  </g>
);

// ===== P4: 物語+ワイプ (神殿で、店員も電気もなしに動く壺) =====
const P4: React.FC = () => (
  <g>
    <g transform="scale(0.6667)"><TempleBG y={980} /></g>
    <HolyPot x={560} y={672} s={1.05} />
    <AncientPerson x={300} y={672} s={1.05} role="pilgrim" face="surprised" gaze={[3, -1]} />
    <Coin x={560} y={210} r={26} />
    {/* 店員も電気もない印 */}
    <g transform="translate(850 360)">
      <circle r={62} fill={KRP.white} stroke={INK} strokeWidth={6} />
      <path d="M -8 -40 L -26 6 L 0 6 L -10 42 L 26 -8 L 2 -8 L 14 -40 Z" fill={KRP.yellow} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <line x1={-44} y1={-44} x2={44} y2={44} stroke={KRP.red} strokeWidth={12} strokeLinecap="round" />
    </g>
    <Big x={40} y={128} size={96} text="電気なしで、動く？" fill={KRP.yellow} sw={20} />
    <Wipe id="jhWipe" cx={1110} cy={540} />
  </g>
);

export const JihankiThumbArt: React.FC<{ p: P }> = ({ p }) =>
  p === 1 ? <P1 /> : p === 2 ? <P2 /> : p === 3 ? <P3 /> : <P4 />;

// P2 の文字ちがい4案 (p: 1=a 2=b 3=c 4=d)
export const JihankiP2VarArt: React.FC<{ p: P }> = ({ p }) =>
  p === 1 ? <P2a /> : p === 2 ? <P2b /> : p === 3 ? <P2c /> : <P2d />;
const P2_VAR_NAMES = ["", "P2a 立体文字", "P2b 爆発フキダシ", "P2c テロップ風 (金)", "P2d 1文字ずつタイル"];
export const JihankiP2a = makeThumb(JihankiP2VarArt, 1);
export const JihankiP2b = makeThumb(JihankiP2VarArt, 2);
export const JihankiP2c = makeThumb(JihankiP2VarArt, 3);
export const JihankiP2d = makeThumb(JihankiP2VarArt, 4);
export const JihankiP2VarSheet = makeThumbSheet(JihankiP2VarArt, "jhv", P2_VAR_NAMES);
export const JihankiP2VarFeed = makeThumbFeed(JihankiP2VarArt, "jhv", ["最初の自動販売機は、", "何を売っていたのか"], P2_VAR_NAMES);

export const JihankiThumbP1 = makeThumb(JihankiThumbArt, 1);
export const JihankiThumbP2 = makeThumb(JihankiThumbArt, 2);
export const JihankiThumbP3 = makeThumb(JihankiThumbArt, 3);
export const JihankiThumbP4 = makeThumb(JihankiThumbArt, 4);
export const JihankiThumbSheet = makeThumbSheet(JihankiThumbArt, "jh");
export const JihankiThumbFeed = makeThumbFeed(JihankiThumbArt, "jh", ["最初の自動販売機は、", "何を売っていたのか"]);
