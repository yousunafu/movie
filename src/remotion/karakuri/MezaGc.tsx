// 目覚まし回「人はなぜ、自力で起きられないのか」: 文#157〜#168 (12文)
// 台本: docs/mezamashi-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。motif 名は mz_文番号3桁。seed は 6000+文番号。
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
  MachiNami, KnockerUp, BellClock, Clocky, NazoBell, MACHI_WIN, Flame,
} from "./MezaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/MP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  cork: "#C99A63",
  corkDark: "#9E7144",
  sepia: "#C9A97A",
  sepiaDark: "#8A6A44",
  sepiaLight: "#E8D6B4",
  card: "#EDE3CF",
  deskWood: "#7B5331",
  deskWoodDark: "#5E3E24",
  lampGreen: "#3F7A58",
  lampGreenDark: "#2C5A40",
  glove: "#F6F4EE",
  quilt1: "#B86A5A",
  quilt2: "#6E8A6A",
  quilt3: "#C9A458",
  quilt4: "#6F7FA8",
  shadow: "#1C2036",
  cat: "#2A2526",
  cap: "#E8E2D6",
  bruise: "#3B2E4A",
  tea: "#E9E2D2",
  maroon: "#8E3A4A",
  maroonDark: "#6A2836",
  hairBrown: "#7A4A2A",
  hunting: "#5E5A50",
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

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #157 さて、ここで、冒頭の謎です。
// 格: 並 / seed 6157
// 絵: どこ: Shinshitsu (sky=0, sleeper=1, alarms=0) の寝室の壁 (序の寝室の続き、夜)。壁にコルクの掲示板がかかっている。演出: カメラが寝ているあなたのベッドから壁の掲示板へぐっと寄ると、掲示板の真ん中に、序で出てきた謎を思い出させる大きな「?」の紙がぱちんと画鋲で留まる。そのまわりに、ここまでの旅で出会った「起こす人」の小さな写真が赤い糸でつながれながら、ぺたぺたと貼られていく (鶏人の赤い冠・修道院の鈴・塔の番人のランタン・ノッカー・アップの棒)。最後のノッカー・アップの棒の写真から赤い糸が「?」の紙へ伸びて、ぴんと張る。寝ているあなたが寝言で口をもぐもぐ。腕の出る人物なし (あなたは布団の中で両腕)。動き: f0-40 掲示板へ寄る / f40-60 「?」の紙がぱちん / f60-120 写真がぺたぺた (4枚)・赤い糸が伸びる / f120 糸がぴんと張る
// どこ: Shinshitsu (夜・あなたが深く寝ている) の左の壁。左の山の絵の上にコルクの掲示板を掛ける (壁は左へ描き足す)
// 演出: 部屋全体 → 掲示板へぐっと寄る。真ん中に大きな「?」の紙が画鋲でぱちん。四隅に起こす人の写真
//       (鶏人の冠・修道院の鈴・番人のランタン・ノッカー・アップの棒) が順にぺた、赤い糸でつながり、
//       最後の棒の写真から「?」へ糸が伸びてぴんと張る。右下からはあなたの寝言「むにゃ」が漂う
// 動き: f0-22 寄る / f14-24 「?」ぱちん / f22-40 写真4枚 / f38-48 最後の糸が張る (f45でほぼ完成) / 以後 糸の震え・寝言
const MzGcPhoto: React.FC<{ x: number; y: number; rot: number; t: number; kind: number; f: number }> = ({ x, y, rot, t, kind, f }) => {
  const k = pop(clamp01(t));
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}>
      <rect x={-62} y={-56} width={124} height={118} fill="#F4EEE2" stroke={C.ink} strokeWidth={4} />
      <rect x={-52} y={-46} width={104} height={84} fill={["#3A3550", "#3F3A3A", "#2E3346", "#2B3450"][kind]} stroke={C.ink} strokeWidth={2.5} />
      {kind === 0 && (
        /* 鶏人の赤い冠 (とさか付き) */
        <g>
          <path d="M -30 30 Q -32 -4 0 -6 Q 32 -4 30 30 Z" fill={KRP.red} stroke={C.ink} strokeWidth={3} />
          <path d="M -16 -6 Q -18 -26 -8 -22 Q -6 -36 4 -28 Q 10 -40 16 -24 Q 26 -26 20 -6 Z" fill="#E8463A" stroke={C.ink} strokeWidth={3} />
          <rect x={-34} y={24} width={68} height={10} rx={4} fill="#B33024" stroke={C.ink} strokeWidth={2.5} />
        </g>
      )}
      {kind === 1 && (
        /* 修道院の手鈴 */
        <g transform={`rotate(${Math.sin(f / 7) * 6} 0 -30)`}>
          <rect x={-5} y={-38} width={10} height={20} rx={3} fill={MP.woodDark} stroke={C.ink} strokeWidth={2.5} />
          <path d="M -22 22 Q -22 -18 0 -18 Q 22 -18 22 22 L 28 28 L -28 28 Z" fill={MP.brass} stroke={C.ink} strokeWidth={3} />
          <circle cx={0} cy={32} r={5} fill={MP.brassDark} stroke={C.ink} strokeWidth={2} />
          <path d="M -12 -6 Q -14 8 -14 18" stroke={MP.brassLight} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      )}
      {kind === 2 && (
        /* 塔の番人のランタン */
        <g>
          <circle cx={0} cy={4} r={34} fill={MP.glow} opacity={0.3} />
          <path d="M -10 -30 Q 0 -42 10 -30" stroke={C.ink} strokeWidth={3} fill="none" />
          <rect x={-20} y={-30} width={40} height={8} fill={MP.iron} stroke={C.ink} strokeWidth={2.5} />
          <rect x={-16} y={-22} width={32} height={44} fill="#FFE7A0" stroke={C.ink} strokeWidth={3} />
          <path d="M 0 16 Q -6 6 0 -6 Q 6 6 0 16 Z" fill={MP.flame} />
          <rect x={-20} y={22} width={40} height={8} fill={MP.iron} stroke={C.ink} strokeWidth={2.5} />
        </g>
      )}
      {kind === 3 && (
        /* ノッカー・アップの長い棒と先の針金の房 */
        <g transform="rotate(-38)">
          <rect x={-4} y={-30} width={8} height={78} fill={MP.wood} stroke={C.ink} strokeWidth={2.5} />
          {[-12, -6, 0, 6, 12].map((a) => (
            <line key={a} x1={0} y1={-30} x2={a * 1.1} y2={-46 - Math.abs(a) * -0.3} stroke={KRP.silver} strokeWidth={3} strokeLinecap="round" />
          ))}
          <rect x={-6} y={-34} width={12} height={8} fill={MP.ironLight} stroke={C.ink} strokeWidth={2} />
        </g>
      )}
      {/* 画鋲 */}
      <circle cx={0} cy={-50} r={9} fill={[KRP.green, KRP.blue, KRP.yellow, KRP.orange][kind]} stroke={C.ink} strokeWidth={3} />
    </g>
  );
};
const Mz157: React.FC<{ f: number }> = ({ f }) => {
  const zk = easeInOut(seg(f, 0, 22));
  const sc = lerp(1, 1.75, zk);
  const fx = lerp(960, 235, zk), fy = lerp(540, 305, zk);
  const tx = 960, ty = lerp(540, 452, zk);
  const qT = seg(f, 14, 22);
  const qSnap = f >= 22 && f < 27 ? Math.sin((f - 22) * 1.4) * 4 : 0;
  // 写真の位置 (台本の旅の順: 鶏人 → 修道院 → 番人 → ノッカー・アップ)
  const PH: [number, number, number][] = [[118, 178, -6], [352, 172, 5], [356, 432, -4], [112, 430, 6]];
  const phT = PH.map((_, i) => seg(f, 22 + i * 5, 28 + i * 5));
  // 糸 (写真の画鋲どうし)。tight は最後の糸が張るまでのたるみ
  const pin = (i: number): [number, number] => [PH[i][0], PH[i][1] - 50];
  const Q: [number, number] = [235, 228];
  const thread = (a: [number, number], b: [number, number], t: number, sag: number, key: string) => {
    if (t <= 0) return null;
    const ex = lerp(a[0], b[0], t), ey = lerp(a[1], b[1], t);
    const mx = (a[0] + ex) / 2, my = (a[1] + ey) / 2 + sag;
    return (
      <g key={key}>
        <path d={`M ${a[0]} ${a[1]} Q ${mx} ${my} ${ex} ${ey}`} stroke="#7A1410" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d={`M ${a[0]} ${a[1]} Q ${mx} ${my} ${ex} ${ey}`} stroke="#D4302A" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      </g>
    );
  };
  const lastT = seg(f, 38, 44);
  const tight = seg(f, 44, 48);
  const twang = f > 48 && f < 70 ? Math.sin((f - 48) * 1.6) * 14 * (1 - (f - 48) / 22) : 0;
  const lastSag = lerp(40, 0, tight) + twang;
  return (
    <Frame f={f} seed={6157} bg={MP.nightDeep} dark>
      <g transform={`translate(${tx} ${ty}) scale(${sc}) translate(${-fx} ${-fy})`}>
        {/* 寄ったときに見える左側の壁と床 (Shinshitsu の壁紙と同じ縦じま) */}
        <rect x={-900} y={-40} width={880} height={880} fill="#E9DAC2" />
        <g fill="#DCC8AA" opacity={0.7}>
          {Array.from({ length: 15 }, (_, i) => <rect key={i} x={-870 + i * 60} y={-40} width={12} height={880} />)}
        </g>
        <rect x={-900} y={-40} width={880} height={56} fill="#F3EADB" stroke={C.ink} strokeWidth={5} />
        <rect x={-900} y={830} width={880} height={300} fill="#C8986A" />
        <rect x={-900} y={812} width={880} height={22} fill="#F3EADB" stroke={C.ink} strokeWidth={5} />
        <rect x={-900} y={-40} width={880} height={1160} fill={MP.nightDeep} opacity={0.52} />
        <Shinshitsu f={f} sky={0} sleeper={1} alarms={0} time={2 * 60 + 40} />
        {/* コルクの掲示板 (木の枠) */}
        <g>
          <line x1={235} y1={104} x2={235} y2={70} stroke={C.ink} strokeWidth={3} />
          <circle cx={235} cy={66} r={6} fill={MP.brass} stroke={C.ink} strokeWidth={2.5} />
          <rect x={34} y={100} width={402} height={412} rx={8} fill={MP.wood} stroke={C.ink} strokeWidth={7} />
          <rect x={52} y={118} width={366} height={376} fill={C.cork} stroke={C.ink} strokeWidth={4} />
          <g fill={C.corkDark} opacity={0.75}>
            {Array.from({ length: 70 }, (_, i) => (
              <circle key={i} cx={60 + rnd(157, i) * 350} cy={126 + rnd(158, i) * 360} r={2 + rnd(159, i) * 3} />
            ))}
          </g>
          {/* 前からの貼り紙 (メモ・切り抜き) で使い込んだ板に */}
          <rect x={300} y={300} width={70} height={46} fill="#F7F1C8" stroke={C.ink} strokeWidth={2.5} transform="rotate(8 335 323)" />
          <path d="M 308 314 h 50 M 308 326 h 40 M 308 338 h 46" stroke="#B9AF88" strokeWidth={3} transform="rotate(8 335 323)" />
          <rect x={66} y={296} width={60} height={50} fill="#DDEBF2" stroke={C.ink} strokeWidth={2.5} transform="rotate(-7 96 321)" />
          {/* 月明かりの当たり */}
          <ellipse cx={250} cy={300} rx={230} ry={220} fill="#C9D6F2" opacity={0.08} />
          {/* 糸 (写真どうし: 前の写真が貼られたら伸びる) */}
          {[0, 1, 2].map((i) => thread(pin(i), pin(i + 1), seg(f, 27 + i * 5, 31 + i * 5), 26, `t${i}`))}
          {/* 写真 */}
          {PH.map(([px, py, r], i) => <MzGcPhoto key={i} x={px} y={py} rot={r} t={phT[i]} kind={i} f={f} />)}
          {/* 「?」の紙 (真ん中・いちばん大きい) */}
          {qT > 0 && (
            <g transform={`translate(235 300) rotate(${-3 + qSnap}) scale(${pop(qT)})`}>
              <rect x={-86} y={-80} width={172} height={176} fill="#FFFDF4" stroke={C.ink} strokeWidth={5} />
              <path d="M -86 70 L -60 96 L -86 96 Z" fill="#E7DCC4" stroke={C.ink} strokeWidth={3} />
              <text x={0} y={58} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150}
                fill={KRP.red} stroke={C.ink} strokeWidth={5} paintOrder="stroke">?</text>
              <circle cx={0} cy={-72} r={12} fill={KRP.red} stroke={C.ink} strokeWidth={3.5} />
              <circle cx={-4} cy={-76} r={4} fill={KRP.white} opacity={0.8} />
            </g>
          )}
          {/* ぱちんの火花 */}
          {f >= 21 && f < 30 && (
            <g opacity={1 - (f - 21) / 9} stroke={KRP.yellow} strokeWidth={5} strokeLinecap="round">
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const a = (i / 6) * Math.PI * 2, r0 = 22 + (f - 21) * 3, r1 = r0 + 16;
                return <line key={i} x1={235 + Math.cos(a) * r0} y1={228 + Math.sin(a) * r0} x2={235 + Math.cos(a) * r1} y2={228 + Math.sin(a) * r1} />;
              })}
            </g>
          )}
          {/* 最後の糸: ノッカー・アップの棒の写真 → 「?」の画鋲。ぴんと張る */}
          {thread(pin(3), Q, lastT, lastSag, "last")}
          {tight > 0.9 && f < 60 && (
            <g opacity={1 - (f - 48) / 12} stroke={KRP.white} strokeWidth={4} strokeLinecap="round">
              <path d="M 160 160 l -12 -12 M 176 150 l -4 -16 M 148 176 l -16 -4" />
            </g>
          )}
          {/* 掲示板の影の暗さ (夜) */}
          <rect x={34} y={100} width={402} height={412} fill={MP.nightDeep} opacity={0.18} />
        </g>
        {/* 寝言「むにゃ」(右のベッドから漂ってくる) */}
        {[0, 1].map((i) => {
          const t = ((f + i * 40) % 80) / 80;
          return (
            <text key={i} x={lerp(760, 560, t)} y={lerp(600, 520, t) + Math.sin(t * 9) * 8} fontFamily={FONT} fontWeight={900}
              fontSize={34} fill={KRP.white} stroke={C.ink} strokeWidth={2.5} paintOrder="stroke" opacity={Math.sin(t * Math.PI) * 0.9}>
              むにゃ
            </text>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #158 人を起こすのが仕事のノッカー・アップは、毎朝、誰に起こしてもらっていたのか。
// 格: 山 / seed 6158
// 絵: どこ: MachiNami (sky=0, windows=全部暗い) の長屋の一軒、ノッカー・アップ本人の家の2階の寝室を、窓の外から見る。夜中。窓辺に棒が立てかけてある。演出: 窓の中で KnockerUp (pose="sleep", 山高帽は壁の釘に掛かっている、赤いマフラーは首に巻いたまま) がベッドで寝ている。その窓の外には、誰もいない石畳とガス灯だけ (起こしに来る人が見当たらない)。窓ガラスの右上に、NazoBell (solved=false, s=大きめ) がぽんと出て「?」が揺れる。寝ている KnockerUp の頭上の Zzz が「?」に形を変える。窓の外の通りの角から、誰かが来るか…とカメラが通りをパンするが、猫が1匹横切るだけ。腕は2本 (pose="sleep" で両腕を布団の上に)。動き: f0-40 窓の中の寝姿 / f40-60 NazoBell がぽん / f60-120 カメラが通りをパン・猫だけ / f120-150 Zzz が「?」に
// どこ: MachiNami (夜・窓は全部暗い) の3軒目の2階の窓を、外から大写し。窓の中はノッカー・アップ本人の寝室
// 演出: 窓の中でノッカー・アップがつぎはぎの布団で寝ている (赤いマフラーは巻いたまま・両腕は布団の上・
//       山高帽は壁の釘・棒は窓辺に立てかけ)。ガラスの右上に NazoBell がぽん。カメラが引いて通りをパンするが、
//       起こしに来る人はいない。横切るのは黒猫1匹だけ。最後に窓へ戻ると、Zzz に「?」が混じって浮かぶ
// 動き: f0-60 窓の大写し (ゆっくり寄る) / f18-30 NazoBell ぽん / f60-110 引いて通りへ / f95-160 猫が横切る / f140-175 窓へ戻る・Zzz が「?」に
const logLerp = (a: number, b: number, t: number) => Math.exp(lerp(Math.log(a), Math.log(b), t));
const cam = (sc: number, fx: number, fy: number, tx = 960, ty = 540) => `translate(${tx} ${ty}) scale(${sc}) translate(${-fx} ${-fy})`;
// 山高帽 (KnockerUp と同じ形)。x,y = つばの中心
const MzGcBowler: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={84} ry={14} fill="#2C2A2E" stroke={C.ink} strokeWidth={4} />
    <path d="M -52 -2 Q -52 -64 0 -66 Q 52 -64 52 -2 Z" fill="#2C2A2E" stroke={C.ink} strokeWidth={4} />
    <path d="M -52 -14 Q 0 -6 52 -14" stroke="#5A5560" strokeWidth={7} fill="none" />
    <path d="M -32 -50 Q -18 -58 -4 -58" stroke="#6A6670" strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);
// 釘 (壁に打った小さな釘)
const MzGcNail: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g><circle cx={x} cy={y} r={7} fill={MP.ironLight} stroke={C.ink} strokeWidth={3} /><line x1={x} y1={y} x2={x + 4} y2={y + 10} stroke={C.ink} strokeWidth={3} /></g>
);
// 長い棒 (KnockerUp と同じ見た目。B=根元, T=先)
const MzGcPole: React.FC<{ B: [number, number]; T: [number, number]; s?: number }> = ({ B, T, s = 1 }) => {
  const dx = T[0] - B[0], dy = T[1] - B[1], len = Math.max(Math.hypot(dx, dy), 1), ux = dx / len, uy = dy / len;
  const a0 = Math.atan2(uy, ux);
  return (
    <g>
      <line x1={B[0]} y1={B[1]} x2={T[0]} y2={T[1]} stroke={C.ink} strokeWidth={13 * s} strokeLinecap="round" />
      <line x1={B[0]} y1={B[1]} x2={T[0]} y2={T[1]} stroke={MP.woodLight} strokeWidth={7 * s} strokeLinecap="round" />
      <line x1={T[0] - ux * 26 * s} y1={T[1] - uy * 26 * s} x2={T[0]} y2={T[1]} stroke={MP.iron} strokeWidth={10 * s} strokeLinecap="round" />
      {[-34, -20, -8, 4, 16, 28, 38].map((d, i) => {
        const a = a0 + (d * Math.PI) / 180, ll = (24 + (i % 3) * 6) * s;
        return <path key={i} d={`M ${T[0]} ${T[1]} q ${Math.cos(a) * ll * 0.5} ${Math.sin(a) * ll * 0.5} ${Math.cos(a) * ll} ${Math.sin(a) * ll}`} stroke={MP.ironLight} strokeWidth={2.6 * s} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};
// 寝ている人のベッド一式 (横から。頭が左)。x,y = KnockerUp sleep の足元。床は y+190s
//   who: "ku"=ノッカー・アップ (KnockerUp sleep) / "none"=人なし (人はシーン側で描く)
const MzGcBed: React.FC<{
  id: string; x: number; y: number; s?: number; f: number; who?: "ku" | "none"; old?: boolean; scarf?: boolean; arms?: boolean;
  quilt?: boolean; quiltLift?: number; frame?: string; slot?: React.ReactNode;
}> = ({ id, x, y, s = 1, f, who = "ku", old = false, scarf = false, arms = true, quilt = true, quiltLift = 0, frame = MP.wood, slot }) => {
  const br = Math.sin(f / 20) * 4 * s;
  const qTop = y - 66 * s - br - quiltLift;
  const qPath = `M ${x - 150 * s} ${y + 52 * s} L ${x - 153 * s} ${qTop + 18 * s} Q ${x - 110 * s} ${qTop - 6 * s} ${x - 40 * s} ${qTop + 4 * s} Q ${x + 30 * s} ${qTop + 8 * s} ${x + 62 * s} ${y - 8 * s} L ${x + 66 * s} ${y + 104 * s} L ${x - 150 * s} ${y + 104 * s} Z`;
  const cols = [C.quilt1, C.quilt2, C.quilt3, C.quilt4];
  return (
    <g>
      {/* 頭板 (左)・足板 (右) */}
      <rect x={x - 336 * s} y={y - 130 * s} width={34 * s} height={320 * s} rx={8 * s} fill={frame} stroke={C.ink} strokeWidth={6 * s} />
      <circle cx={x - 319 * s} cy={y - 134 * s} r={14 * s} fill={frame} stroke={C.ink} strokeWidth={5 * s} />
      <rect x={x + 50 * s} y={y - 40 * s} width={30 * s} height={230 * s} rx={8 * s} fill={frame} stroke={C.ink} strokeWidth={6 * s} />
      <circle cx={x + 65 * s} cy={y - 44 * s} r={12 * s} fill={frame} stroke={C.ink} strokeWidth={5 * s} />
      {/* マットレスと側板 */}
      <rect x={x - 304 * s} y={y + 40 * s} width={356 * s} height={64 * s} rx={14 * s} fill="#EDE6D6" stroke={C.ink} strokeWidth={5 * s} />
      <rect x={x - 304 * s} y={y + 104 * s} width={356 * s} height={40 * s} fill={frame} stroke={C.ink} strokeWidth={5 * s} />
      {/* 枕 */}
      <ellipse cx={x - 232 * s} cy={y + 30 * s} rx={74 * s} ry={30 * s} fill={KRP.white} stroke={C.ink} strokeWidth={5 * s} />
      {who === "ku" && <KnockerUp x={x} y={y} s={s} f={f} pose="sleep" old={old} />}
      {slot}
      {who === "ku" && scarf && (
        <g>
          <rect x={x - 180 * s} y={y - 54 * s} width={30 * s} height={108 * s} rx={12 * s} fill="#C8372B" stroke={C.ink} strokeWidth={4 * s} />
          <path d={`M ${x - 168 * s} ${y + 40 * s} q ${30 * s} ${6 * s} ${44 * s} ${30 * s} l ${-14 * s} ${8 * s} q ${-14 * s} ${-18 * s} ${-36 * s} ${-22 * s} Z`} fill="#C8372B" stroke={C.ink} strokeWidth={4 * s} />
        </g>
      )}
      {/* つぎはぎの掛け布団 */}
      {quilt && (
        <g>
          <defs><clipPath id={id}><path d={qPath} /></clipPath></defs>
          <path d={qPath} fill={cols[0]} />
          <g clipPath={`url(#${id})`}>
            {Array.from({ length: 6 }, (_, c) => Array.from({ length: 4 }, (_, r) => (
              <rect key={`${c}-${r}`} x={x - 180 * s + c * 42 * s} y={qTop - 10 * s + r * 44 * s} width={42 * s} height={44 * s}
                fill={cols[(c * 3 + r * 2) % 4]} stroke={mixColorGc(cols[(c * 3 + r * 2) % 4])} strokeWidth={3 * s} strokeDasharray={`${6 * s} ${5 * s}`} />
            )))}
          </g>
          <path d={qPath} fill="none" stroke={C.ink} strokeWidth={6 * s} strokeLinejoin="round" />
        </g>
      )}
      {/* 布団の上の両腕 (寝間着の袖) */}
      {who === "ku" && quilt && arms && [-1, 1].map((sd) => {
        const sx = x - 140 * s, sy = y + sd * 34 * s - br * 0.5;
        const hx = x - 92 * s, hy = y + sd * 12 * s - br;
        return (
          <g key={sd}>
            <line x1={sx} y1={sy} x2={hx} y2={hy} stroke={C.ink} strokeWidth={34 * s} strokeLinecap="round" />
            <line x1={sx} y1={sy} x2={hx} y2={hy} stroke="#E9E3D4" strokeWidth={25 * s} strokeLinecap="round" />
            <circle cx={hx + 8 * s} cy={hy} r={15 * s} fill={KRP.white} stroke={C.ink} strokeWidth={4 * s} />
          </g>
        );
      })}
    </g>
  );
};
const mixColorGc = (c: string) => {
  const n = parseInt(c.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * 0.72), g = Math.round(((n >> 8) & 255) * 0.72), b = Math.round((n & 255) * 0.72);
  return `rgb(${r},${g},${b})`;
};
// 黒猫 (横向き・左へ歩く)。x,y = 足元
const MzGcCat: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const st = Math.sin(f / 3);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-34, -18, 22, 38].map((lx, i) => (
        <line key={i} x1={lx} y1={-30} x2={lx + (i % 2 ? st : -st) * 8} y2={0} stroke={C.cat} strokeWidth={10} strokeLinecap="round" />
      ))}
      <path d={`M 40 -44 Q 70 -70 ${66 + st * 4} -110 Q ${62 + st * 4} -122 ${56 + st * 3} -112`} stroke={C.cat} strokeWidth={10} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={-42} rx={50} ry={22} fill={C.cat} stroke={C.ink} strokeWidth={3} />
      <circle cx={-52} cy={-62} r={20} fill={C.cat} stroke={C.ink} strokeWidth={3} />
      <path d="M -66 -74 L -66 -96 L -52 -80 Z M -48 -80 L -38 -96 L -36 -74 Z" fill={C.cat} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
      <ellipse cx={-58} cy={-64} rx={4} ry={5} fill={KRP.yellow} />
      <ellipse cx={-46} cy={-64} rx={4} ry={5} fill={KRP.yellow} />
      <path d="M -70 -56 l -14 -2 M -70 -52 l -14 4" stroke="#8A8488" strokeWidth={2} />
    </g>
  );
};
const Mz158: React.FC<{ f: number }> = ({ f }) => {
  const [wx, wy] = MACHI_WIN[2];
  const k1 = easeInOut(seg(f, 60, 110));
  const k2 = easeInOut(seg(f, 140, 175));
  const A = { s: lerp(3.9, 4.2, seg(f, 0, 60)), x: wx, y: wy + 4 };
  const B = { s: 1.2, x: 1150, y: 640 };
  const D = { s: 2.4, x: wx + 40, y: 410 };
  const sc = k2 > 0 ? logLerp(B.s, D.s, k2) : logLerp(A.s, B.s, k1);
  const fx = k2 > 0 ? lerp(B.x, D.x, k2) : lerp(A.x, B.x, k1);
  const fy = k2 > 0 ? lerp(B.y, D.y, k2) : lerp(A.y, B.y, k1);
  // 窓の中 (ローカル 420×550 → 窓のガラス 130×170)
  const L = 130 / 420;
  const catX = lerp(1780, 420, seg(f, 95, 165));
  return (
    <Frame f={f} seed={6158} bg={MP.nightDeep} dark>
      <g transform={cam(sc, fx, fy)}>
        <MachiNami f={f} sky={0} windows={[0, 0, 0, 0, 0, 0]} />
        <g transform={`translate(${wx - 65} ${wy - 85}) scale(${L})`}>
          <defs><clipPath id="mzgc158win"><rect x={0} y={0} width={420} height={550} /></clipPath></defs>
          <g clipPath="url(#mzgc158win)">
            {/* 部屋の壁 (色あせた花柄の壁紙) と床 */}
            <rect x={0} y={0} width={420} height={550} fill="#6A6280" />
            {Array.from({ length: 6 }, (_, i) => Array.from({ length: 6 }, (_, j) => (
              <circle key={`${i}-${j}`} cx={20 + i * 76 + (j % 2) * 38} cy={20 + j * 70} r={7} fill="#7C7392" />
            )))}
            <rect x={0} y={500} width={420} height={50} fill="#5A4636" />
            {/* 壁の釘の山高帽 */}
            <MzGcNail x={250} y={96} />
            <MzGcBowler x={250} y={142} s={0.85} rot={-6} />
            {/* ベッドと寝ている本人 (マフラーは巻いたまま) */}
            <MzGcBed id="mzgc158q" x={340} y={372} s={0.9} f={f} scarf />
            {/* 窓辺に立てかけた棒 */}
            <MzGcPole B={[396, 548]} T={[376, 40]} s={1.2} />
            {/* 夜の暗さ + 窓から入る街灯の光 */}
            <rect x={0} y={0} width={420} height={550} fill={MP.nightDeep} opacity={0.42} />
            <polygon points="420,0 420,550 120,550 260,0" fill={MP.glow} opacity={0.08} />
            {/* 開けたカーテン */}
            <path d="M 0 0 L 70 0 Q 50 280 80 550 L 0 550 Z" fill="#5E4250" stroke={C.ink} strokeWidth={5} />
            <path d="M 420 0 L 360 0 Q 380 280 350 550 L 420 550 Z" fill="#5E4250" stroke={C.ink} strokeWidth={5} opacity={0.0} />
          </g>
          {/* 窓わく (上げ下げ窓の桟) */}
          <rect x={0} y={0} width={420} height={550} fill="none" stroke="#F1EADF" strokeWidth={18} />
          <path d="M 0 275 L 420 275" stroke="#F1EADF" strokeWidth={14} />
          <rect x={0} y={0} width={420} height={550} fill="none" stroke={C.ink} strokeWidth={10} />
          {/* ガラスの映りこみ */}
          <path d="M 40 60 L 120 10 M 60 110 L 180 30" stroke={KRP.white} strokeWidth={8} opacity={0.18} strokeLinecap="round" />
        </g>
        {/* 頭上の Zzz に混じる「?」(最後に窓へ戻ったとき) */}
        {f > 140 && [0, 1].map((i) => {
          const t = ((f - 140) / 40 + i / 2) % 1;
          return <text key={i} x={wx - 30 + t * 10} y={wy - 10 - t * 70} fontFamily={FONT} fontWeight={900} fontSize={22 + t * 10}
            fill={KRP.red} stroke={C.ink} strokeWidth={1.5} paintOrder="stroke" opacity={Math.sin(t * Math.PI) * seg(f, 140, 150)}>?</text>;
        })}
        {/* NazoBell (窓ガラスの右上) */}
        {seg(f, 18, 30) > 0 && (
          <g transform={`translate(${wx + 52} ${wy - 68}) scale(${pop(seg(f, 18, 30))}) translate(${-(wx + 52)} ${-(wy - 68)})`}>
            <NazoBell x={wx + 52} y={wy - 68} s={0.42} f={f} />
          </g>
        )}
        {/* 黒猫 (通りを横切る) */}
        {f > 95 && f < 170 && <MzGcCat x={catX} y={905} s={0.8} f={f} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #159 記録によると、多くのノッカー・アップは、そもそも、寝ていませんでした。
// 格: 山 / seed 6159
// 絵: どこ: #158 と同じノッカー・アップの家の寝室 (続き)。ただしよく見ると、ベッドの布団の中は丸めた毛布と枕 (寝ているように見えたのはダミー)。演出: カメラが寝室から引いていくと、部屋の隅の木の椅子に、本物の KnockerUp (男性版) がランプの下で起きたまま座って、目をぱっちり開けて (face="smile") 手袋をつくろったり、紅茶を飲んだりしている。ベッドのダミーの山高帽がずり落ちる。テーブルの上には古い記録の帳面が開いていて、中のページに、ランプの下で起きている人の絵 (小さく、3人) が描かれる (「多くの」なので3人中2人は起きている絵、1人は点線)。腕は2本 (pose="hold" で片手に紅茶、片手に手袋)。動き: f0-50 引く / f50-80 ダミーの帽子がずり落ちる / f80-120 起きている本物がこちらに会釈 / 帳面のページがめくれる
// どこ: #158 のノッカー・アップの寝室の中 (色あせた壁紙・板張りの床・窓辺の棒・壁の振り子時計・木の椅子・ランプの小机)
// 演出: ベッドの寝姿の大写しから引くと、ナイトキャップがずり落ちて、枕に顔を落書きしたダミーだとばれる (Zzz が落ちる)。
//       部屋の隅の椅子では本物が目ぱっちりで起きていて、紅茶と手袋のつくろい。こちらに会釈。
//       小机の古い帳面のページがめくれて、ランプの下で起きている人の絵が3人 (2人は実線・1人は点線)
// 動き: f0-34 引く / f24-38 ナイトキャップがずり落ち・Zzz が落ちる / f36-58 会釈 / f60-78 ページがめくれる / f92-150 帳面へ寄る
const KU_COAT = "#7D828B", KU_COAT_D = "#4A4E57";
// 座っている (または立っている) ノッカー・アップの上着の重ね (赤いマフラー・ボタン)。Person と同じ transform で重ねる
const MzGcKUOverlay: React.FC<{ x: number; y: number; s?: number; f: number; lean?: number; phase?: number; scarf?: boolean; hem?: boolean; hat?: boolean }> = ({ x, y, s = 1, f, lean = 0, phase = 0, scarf = true, hem = false, hat = false }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {hem && <path d="M -58 -60 L 58 -60 L 68 -22 Q 0 -14 -68 -22 Z" fill={KU_COAT} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />}
      {hem && <line x1={0} y1={-60} x2={0} y2={-18} stroke={C.ink} strokeWidth={3.5} />}
      {hat && <MzGcBowler x={0} y={-268} />}
      <path d="M -30 -160 L 0 -118 L 30 -160" stroke={KU_COAT_D} strokeWidth={6} fill="none" />
      {[-136, -110, -84].map((by) => <circle key={by} cx={0} cy={by} r={6} fill={MP.brass} stroke={C.ink} strokeWidth={2.5} />)}
      {scarf && (
        <g>
          <rect x={-52} y={-178} width={104} height={24} rx={11} fill="#C8372B" stroke={C.ink} strokeWidth={4} />
          <path d="M -30 -176 L -26 -156 M 0 -178 L 0 -156 M 30 -176 L 26 -156" stroke="#E8D3B0" strokeWidth={4} />
          <path d={`M 26 -160 Q 40 -130 ${44 + Math.sin(f / 9) * 2} -100 L 62 -104 Q 54 -136 44 -162 Z`} fill="#C8372B" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
        </g>
      )}
    </g>
  );
};
// 文字盤 (数字 12・3・6・9 と目盛り)。min = 0時からの分
const MzGcDial: React.FC<{ r: number; min: number; face?: string }> = ({ r, min, face = "#FBF5E6" }) => {
  const ha = ((min / 60) % 12) * 30, ma = (min % 60) * 6;
  return (
    <g>
      <circle r={r} fill={face} stroke={C.ink} strokeWidth={5} />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={0} y1={-r + 6} x2={0} y2={-r + (i % 3 ? 14 : 22)} stroke={C.ink} strokeWidth={i % 3 ? 3 : 5} transform={`rotate(${i * 30})`} />
      ))}
      {([[12, 0, -1], [3, 1, 0], [6, 0, 1], [9, -1, 0]] as const).map(([n, dx, dy]) => (
        <text key={n} x={dx * r * 0.62} y={dy * r * 0.62 + r * 0.12} textAnchor="middle" fontFamily="serif" fontWeight={700} fontSize={r * 0.3} fill={C.ink}>{n}</text>
      ))}
      <line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke={C.ink} strokeWidth={r * 0.09} strokeLinecap="round" transform={`rotate(${ha})`} />
      <line x1={0} y1={0} x2={0} y2={-r * 0.78} stroke={C.ink} strokeWidth={r * 0.055} strokeLinecap="round" transform={`rotate(${ma})`} />
      <circle r={r * 0.07} fill={MP.brass} stroke={C.ink} strokeWidth={2} />
    </g>
  );
};
// ノッカー・アップの家の部屋 (#159・#160)。世界座標 1960×1080。床は y=700 から
const MzGcKURoom: React.FC<{ f: number; min: number; hatOn?: boolean; scarfOn?: boolean; poleOn?: boolean; door?: number; clockS?: number }> = ({
  f, min, hatOn = true, scarfOn = false, poleOn = true, door = 0,
}) => {
  const pend = Math.sin(f / 8) * 14;
  return (
    <g>
      {/* 壁紙 (色あせた縦じまと小花) */}
      <rect x={-40} y={-60} width={2000} height={780} fill="#C9B48E" />
      <g fill="#BBA47C">{Array.from({ length: 25 }, (_, i) => <rect key={i} x={-30 + i * 82} y={-60} width={22} height={760} />)}</g>
      <g fill="#A88F6A" opacity={0.7}>
        {Array.from({ length: 25 }, (_, i) => Array.from({ length: 6 }, (_, j) => (
          <circle key={`${i}-${j}`} cx={11 - 30 + i * 82} cy={40 + j * 100 + (i % 2) * 50} r={6} />
        )))}
      </g>
      <rect x={-40} y={-60} width={2000} height={40} fill="#9E7A52" stroke={C.ink} strokeWidth={5} />
      {/* 壁のしみ (古い家) */}
      <path d="M 1300 80 q 40 -20 70 10 q 30 30 -10 60 q -50 10 -60 -30 Z" fill="#A88F6A" opacity={0.45} />
      {/* 腰板 */}
      <rect x={-40} y={580} width={2000} height={120} fill={MP.woodDark} stroke={C.ink} strokeWidth={5} />
      <g stroke="#5E3E24" strokeWidth={4}>{Array.from({ length: 21 }, (_, i) => <line key={i} x1={-40 + i * 100} y1={584} x2={-40 + i * 100} y2={700} />)}</g>
      <rect x={-40} y={574} width={2000} height={14} fill={MP.wood} stroke={C.ink} strokeWidth={4} />
      {/* 床 (板張り) と敷物 */}
      <rect x={-40} y={700} width={2000} height={420} fill="#9A6E48" stroke={C.ink} strokeWidth={5} />
      <g stroke="#7E5634" strokeWidth={4}>{[760, 830, 910, 1000].map((ly) => <line key={ly} x1={-40} y1={ly} x2={1960} y2={ly} />)}</g>
      <ellipse cx={1220} cy={960} rx={420} ry={70} fill="#8E4A42" stroke={C.ink} strokeWidth={6} />
      <ellipse cx={1220} cy={960} rx={370} ry={52} fill="none" stroke="#C98A6A" strokeWidth={5} strokeDasharray="16 10" />
      {/* 窓 (カーテンは閉めかけ・すき間から夜の通り) */}
      <rect x={316} y={106} width={268} height={338} fill="#F1EADF" stroke={C.ink} strokeWidth={7} />
      <rect x={332} y={122} width={236} height={306} fill="#1E2440" stroke={C.ink} strokeWidth={3} />
      <circle cx={470} cy={300} r={60} fill={MP.glow} opacity={0.18} />
      <path d="M 332 270 L 568 270 M 450 122 L 450 428" stroke="#F1EADF" strokeWidth={8} />
      <path d="M 300 96 L 420 96 Q 400 270 430 450 L 300 450 Z" fill="#8A5A5A" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 600 96 L 500 96 Q 520 270 492 450 L 600 450 Z" fill="#8A5A5A" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <rect x={290} y={86} width={320} height={12} rx={6} fill={MP.woodDark} stroke={C.ink} strokeWidth={3} />
      <rect x={300} y={440} width={300} height={18} rx={4} fill="#F1EADF" stroke={C.ink} strokeWidth={5} />
      {/* 窓辺に立てかけた棒 */}
      {poleOn && <MzGcPole B={[700, 705]} T={[668, 30]} s={1.15} />}
      {/* 帽子掛け (釘の列) */}
      <rect x={740} y={300} width={200} height={22} rx={4} fill={MP.wood} stroke={C.ink} strokeWidth={4} />
      {[770, 840, 910].map((px) => <circle key={px} cx={px} cy={326} r={8} fill={MP.brass} stroke={C.ink} strokeWidth={3} />)}
      {hatOn && <MzGcBowler x={770} y={378} s={0.8} rot={-4} />}
      {scarfOn && (
        <g>
          <path d="M 832 330 Q 822 420 830 500 L 856 500 Q 852 420 852 330 Z" fill="#C8372B" stroke={C.ink} strokeWidth={4} />
          <path d="M 848 330 Q 870 410 864 470 L 884 470 Q 886 400 866 330 Z" fill="#B02E24" stroke={C.ink} strokeWidth={4} />
          <path d="M 832 492 l 0 14 M 842 494 l 0 14 M 868 462 l 0 14 M 878 462 l 0 14" stroke={C.ink} strokeWidth={3} />
        </g>
      )}
      {/* 振り子の掛け時計 */}
      <g>
        <rect x={930} y={110} width={160} height={360} rx={14} fill={MP.woodDark} stroke={C.ink} strokeWidth={6} />
        <path d="M 920 120 L 1010 70 L 1100 120 Z" fill={MP.wood} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={956} y={300} width={108} height={150} rx={8} fill="#2E2420" stroke={C.ink} strokeWidth={4} />
        <g transform={`rotate(${pend} 1010 300)`}>
          <line x1={1010} y1={300} x2={1010} y2={410} stroke={MP.brassDark} strokeWidth={4} />
          <circle cx={1010} cy={418} r={18} fill={MP.brass} stroke={C.ink} strokeWidth={4} />
        </g>
        <g transform="translate(1010 205)"><MzGcDial r={74} min={min} /></g>
      </g>
      {/* 戸口 (右)。door で開く */}
      <g>
        <rect x={1730} y={170} width={190} height={540} fill="#1A1E34" stroke={C.ink} strokeWidth={6} />
        <path d={`M 1730 170 L ${1730 + 190 * (1 - door * 0.75)} ${170 - door * 30} L ${1730 + 190 * (1 - door * 0.75)} ${710 + door * 30} L 1730 710 Z`} fill="#6E4A2E" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <circle cx={1730 + 190 * (1 - door * 0.75) - 22} cy={450} r={9} fill={MP.brass} stroke={C.ink} strokeWidth={3} />
        <rect x={1716} y={156} width={218} height={18} fill={MP.wood} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 夜の暗さ (部屋だけ。人はこの上に描く) */}
      <rect x={-40} y={-60} width={2000} height={1180} fill={MP.nightDeep} opacity={0.2} />
      {/* 木の椅子 (座面 y=842) の背もたれ */}
      <g>
        {[1088, 1272].map((px) => <rect key={px} x={px - 10} y={600} width={20} height={300} rx={6} fill={MP.wood} stroke={C.ink} strokeWidth={5} />)}
        <rect x={1078} y={600} width={214} height={30} rx={8} fill={MP.wood} stroke={C.ink} strokeWidth={5} />
        <rect x={1078} y={680} width={214} height={18} rx={6} fill={MP.woodLight} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 小机 (天板 y=760) */}
      <g>
        <rect x={1360} y={760} width={22} height={160} fill={MP.woodDark} stroke={C.ink} strokeWidth={5} />
        <rect x={1640} y={760} width={22} height={160} fill={MP.woodDark} stroke={C.ink} strokeWidth={5} />
        <rect x={1340} y={744} width={340} height={26} rx={6} fill={MP.wood} stroke={C.ink} strokeWidth={6} />
        {/* オイルランプ */}
        <ellipse cx={1600} cy={742} rx={34} ry={10} fill={MP.brassDark} stroke={C.ink} strokeWidth={4} />
        <path d="M 1576 742 Q 1570 706 1600 700 Q 1630 706 1624 742 Z" fill={MP.brass} stroke={C.ink} strokeWidth={4} />
        <path d="M 1586 700 Q 1576 660 1590 620 L 1610 620 Q 1624 660 1614 700 Z" fill="#F4F0E0" opacity={0.6} stroke={C.ink} strokeWidth={3.5} />
        <Flame x={1600} y={690} s={0.9} f={f} phase={2} />
      </g>
    </g>
  );
};
// 座る人の座面 (Person の前に描く)
const MzGcChairSeat: React.FC = () => (
  <g>
    <rect x={1070} y={836} width={230} height={22} rx={6} fill={MP.woodLight} stroke={C.ink} strokeWidth={5} />
    {[1090, 1280].map((px) => <rect key={px} x={px - 9} y={856} width={18} height={56} fill={MP.wood} stroke={C.ink} strokeWidth={4} />)}
  </g>
);
const Mz159: React.FC<{ f: number }> = ({ f }) => {
  const kOut = easeInOut(seg(f, 0, 34));
  const kIn = easeInOut(seg(f, 92, 150));
  const sc = kIn > 0 ? logLerp(1.22, 2.3, kIn) : logLerp(2.6, 1.22, kOut);
  const fx = kIn > 0 ? lerp(900, 1500, kIn) : lerp(400, 900, kOut);
  const fy = kIn > 0 ? lerp(600, 712, kIn) : lerp(540, 600, kOut);
  const cap = easeInOut(seg(f, 24, 38));
  const nod = Math.sin(seg(f, 38, 58) * Math.PI) * 12;
  const page = easeInOut(seg(f, 60, 78));
  // ダミーの頭 (枕に落書きの顔)
  const hx = 560 - 228, hy = 560;
  return (
    <Frame f={f} seed={6159} bg={MP.nightDeep}>
      <g transform={cam(sc, fx, fy)}>
        <MzGcKURoom f={f} min={23 * 60 + 40 + f / 30} hatOn />
        {/* ベッドとダミー (丸めた毛布) */}
        <MzGcBed id="mzgc159q" x={560} y={560} s={1} f={0} who="none" quiltLift={6} />
        {/* 落書きの顔の枕 */}
        <g transform={`translate(${hx} ${hy}) rotate(-90)`}>
          <ellipse cx={0} cy={0} rx={62} ry={56} fill="#F4F1E8" stroke={C.ink} strokeWidth={5} />
          <path d="M -30 -10 Q -24 0 -14 -10 M 14 -10 Q 24 0 30 -10" stroke="#3A3A44" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M -12 22 Q 0 32 12 22" stroke="#3A3A44" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M -50 30 l 10 -6 M 50 30 l -10 -6" stroke="#B8B2A4" strokeWidth={3} />
        </g>
        {/* ずり落ちるナイトキャップ (KnockerUp と同じ柄) */}
        <g transform={`translate(${hx - 64 + cap * 30} ${hy + cap * 150}) rotate(${-90 + cap * 120}) scale(0.95)`}>
          <path d="M -64 6 Q -60 -44 0 -50 Q 50 -52 86 -8 L 96 4 Q 40 -32 64 6 Z" fill="#6E8FC0" stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
          <path d="M -40 -32 Q 0 -22 30 -44 M -56 -12 Q 0 -2 52 -28" stroke={KRP.white} strokeWidth={6} fill="none" />
          <rect x={-68} y={0} width={136} height={14} rx={7} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          <circle cx={96} cy={6} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
        </g>
        {/* 偽の Zzz (帽子が落ちると、ぽろぽろ落ちる) */}
        {[0, 1, 2].map((i) => {
          const fall = easeOut(seg(f, 28 + i * 3, 44 + i * 3));
          const t = ((f / 40 + i / 3) % 1);
          const x0 = hx + 30 + i * 34, y0 = hy - 90 - i * 46;
          const zx = x0 + fall * (14 - i * 8), zy = fall > 0 ? lerp(y0, hy + 170 + i * 6, fall * fall) : y0 - t * 20;
          return <text key={i} x={zx} y={zy} fontFamily={FONT} fontWeight={900} fontSize={34 + i * 8} fill={KRP.white} stroke={C.ink} strokeWidth={2.5}
            transform={`rotate(${fall * (90 + i * 40)} ${zx} ${zy})`} opacity={fall > 0 ? 1 : 0.6 + 0.4 * Math.sin(t * Math.PI)}>Z</text>;
        })}
        {cap > 0.6 && <text x={hx + 60} y={hy - 70} fontFamily={FONT} fontWeight={900} fontSize={56} fill={KRP.red} stroke={C.ink} strokeWidth={3} paintOrder="stroke"
          opacity={seg(f, 32, 38)}>!</text>}
        {/* 本物: 椅子で起きている (紅茶と手袋) */}
        <Person x={1180} y={900} s={1} f={f} face="smile" pose="sit" cloth={KU_COAT} clothDark={KU_COAT_D} hair="cap" lean={nod} gaze={[-3, 1]} />
        <MzGcKUOverlay x={1180} y={900} f={f} lean={nod} />
        <MzGcChairSeat />
        {/* 右手の紅茶 (湯気) */}
        <g transform={`translate(1282 ${830 + Math.sin(f / 13) * 3})`}>
          <path d="M -22 -30 L -18 4 Q 0 12 18 4 L 22 -30 Z" fill={C.tea} stroke={C.ink} strokeWidth={4} />
          <path d="M 20 -22 q 16 0 12 14 q -4 8 -14 4" stroke={C.ink} strokeWidth={4} fill="none" />
          <ellipse cx={0} cy={6} rx={30} ry={7} fill={C.tea} stroke={C.ink} strokeWidth={3.5} />
          <ellipse cx={0} cy={-30} rx={22} ry={5} fill="#8A5A2E" stroke={C.ink} strokeWidth={3} />
          {[0, 1].map((i) => {
            const t = ((f / 36 + i / 2) % 1);
            return <path key={i} d={`M ${-6 + i * 10} -40 q 8 -14 0 -28 q -8 -14 0 -28`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={Math.sin(t * Math.PI) * 0.7} transform={`translate(0 ${-t * 20})`} />;
          })}
        </g>
        {/* 左手のつくろい中の手袋 (針と糸) */}
        <g transform={`translate(1076 ${826 + Math.sin(f / 13) * 3}) rotate(-20)`}>
          <path d="M -26 20 L -26 -10 L -20 -34 L -12 -12 L -8 -40 L 0 -12 L 4 -38 L 12 -10 L 18 -30 L 24 -4 L 26 20 Z" fill="#5C6E58" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M -26 10 L 26 10" stroke="#3E4C3A" strokeWidth={4} strokeDasharray="5 4" />
          <line x1={10} y1={-10} x2={34} y2={-44 + Math.sin(f / 5) * 6} stroke={KRP.silver} strokeWidth={3} />
          <path d={`M 34 ${-44 + Math.sin(f / 5) * 6} q 20 10 10 40`} stroke={KRP.red} strokeWidth={2} fill="none" />
        </g>
        {/* 会釈の汗ならぬ、にっこりの印 */}
        {nod > 2 && <path d="M 1250 600 l 16 -16 M 1262 612 l 22 -6" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />}
        {/* 古い記録の帳面 (小机の上) */}
        <g transform="translate(1500 742)">
          <path d="M -130 0 L -122 -78 L 0 -72 L 122 -78 L 130 0 L 0 6 Z" fill="#6E3E2A" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -120 -4 L -114 -70 L -2 -66 L -2 2 Z" fill="#EFE4C8" stroke={C.ink} strokeWidth={3.5} />
          {[0, 1, 2, 3].map((i) => <line key={i} x1={-106} y1={-56 + i * 14} x2={-14} y2={-54 + i * 14} stroke="#9C8A68" strokeWidth={2.5} />)}
          {/* 右のページ (めくれた後: ランプの下で起きている3人) */}
          <path d="M 2 2 L 2 -66 L 114 -70 L 120 -4 Z" fill="#EFE4C8" stroke={C.ink} strokeWidth={3.5} />
          {page > 0.5 && [0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${24 + i * 34} -12)`} opacity={seg(f, 70 + i * 3, 76 + i * 3)}>
              {i < 2 ? (
                <g>
                  <path d="M 0 -50 l -6 8 l 12 0 Z" fill={MP.flame} stroke={C.ink} strokeWidth={1.5} />
                  <circle cx={0} cy={-28} r={8} fill={KRP.white} stroke={C.ink} strokeWidth={2} />
                  <circle cx={-3} cy={-28} r={1.6} fill={C.ink} /><circle cx={3} cy={-28} r={1.6} fill={C.ink} />
                  <rect x={-8} y={-20} width={16} height={18} rx={3} fill={KU_COAT} stroke={C.ink} strokeWidth={2} />
                </g>
              ) : (
                <g fill="none" stroke={C.ink} strokeWidth={2} strokeDasharray="3 3">
                  <circle cx={0} cy={-28} r={8} />
                  <rect x={-8} y={-20} width={16} height={18} rx={3} />
                </g>
              )}
            </g>
          ))}
          {/* めくれていくページ */}
          {page > 0 && page < 1 && (
            <path d={`M 2 2 L 2 -66 L ${lerp(114, -110, page)} ${-70 - Math.sin(page * Math.PI) * 30} L ${lerp(120, -116, page)} ${-4 - Math.sin(page * Math.PI) * 24} Z`}
              fill="#F6EED8" stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
          )}
        </g>
        {/* 部屋の明かり: ランプのまわりだけ暖かく、ほかは夜 */}
        <circle cx={1600} cy={690} r={300} fill={MP.glow} opacity={0.08 + 0.02 * Math.sin(f / 4)} />
        <circle cx={1600} cy={690} r={160} fill={MP.glow} opacity={0.08} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #160 夜通し起きていて、朝の3時ごろから、回りはじめたのです。
// 格: 山 / seed 6160
// 絵: どこ: ノッカー・アップの家の部屋 (#159 の続き) の壁の掛け時計 → 玄関 → 夜の MachiNami の通り。演出: 壁の掛け時計の針が夜の10時、11時、12時…と早回しで進み、その間 KnockerUp は椅子で起きたまま (トランプのひとり遊び・紅茶のおかわり・あくびをかみ殺す)。時計が3時を指した瞬間、ぱっと立ち上がって山高帽をかぶり、赤いマフラーを巻き、棒をつかんで玄関を出る。外の MachiNami (sky=0, windows=全部暗い) の真っ暗な通りへ歩き出し、最初の窓をコンコン。時計の札「3時」。腕は2本 (pose="walk" で片手に棒、片手で帽子をかぶる)。カメラは掛け時計の大写しから、玄関を通って通りへパン。動き: f0-60 時計の早回し・ひとり遊び / f60 3時 / f60-100 身支度 / f100-150 通りへパン・最初のコンコン
// どこ: #159 の部屋 (振り子時計の大写し) → 戸口 → 外の MachiNami の真っ暗な通り (部屋の右に家の壁の断面でつなぐ)
// 演出: 時計が夜10時から早回しで進み、そのあいだ本人は椅子でトランプのひとり遊び・紅茶・あくびをかみ殺す。
//       3時を指した瞬間に立ち上がり、釘の山高帽とマフラーが飛んできて身支度、棒をつかんで戸口から外へ。
//       通りの最初の窓をコンコン → 窓に明かり。札「3時」
// 動き: f0-34 時計の早回し (寄り→引き) / f34 3時 / f36-46 早業の身支度 / f60-106 戸口を出て通りへパン / f106- 最初のコンコン
const Mz160: React.FC<{ f: number }> = ({ f }) => {
  const lapse = easeInOut(seg(f, 0, 34));
  const min = 22 * 60 + 300 * lapse + Math.max(0, f - 34) / 30;
  const k0 = easeInOut(seg(f, 0, 26));
  const k1 = easeInOut(seg(f, 60, 106));
  const sc = logLerp(2.1, 1, k0);
  const fx = lerp(lerp(1010, 960, k0), 2620, k1);
  const fy = lerp(250, 540, k0);
  const up = f >= 40;
  const walkK = easeInOut(seg(f, 60, 104));
  const kx = lerp(1180, 2330, walkK);
  const fly = easeOut(seg(f, 34, 41));
  const yawn = lapse > 0.55 && lapse < 0.8;
  const face = yawn ? "surprised" : lapse < 0.3 ? "normal" : lapse < 0.55 ? "smile" : "normal";
  const cards = Math.floor(lapse * 8);
  return (
    <Frame f={f} seed={6160} bg={MP.nightDeep} dark>
      <g transform={cam(sc, fx, fy)}>
        {/* 外の通り (部屋の右につなぐ) */}
        <g transform="translate(2000 0)">
          <MachiNami f={f} sky={0} windows={[0, seg(f, 128, 136), 0, 0, 0, 0]} />
        </g>
        <MzGcKURoom f={f} min={min} hatOn={f < 35} scarfOn={f < 35} poleOn={!up} door={easeOut(seg(f, 62, 74))} />
        {/* 家の壁の断面 (部屋と通りの境) */}
        <rect x={1924} y={-60} width={86} height={1180} fill={MP.brickDark} stroke={C.ink} strokeWidth={6} />
        <g stroke={MP.mortar} strokeWidth={3} opacity={0.6}>{Array.from({ length: 22 }, (_, i) => <line key={i} x1={1928} y1={-40 + i * 52} x2={2006} y2={-40 + i * 52} />)}</g>
        {/* 早回しの印 */}
        {f < 34 && (
          <g transform="translate(1140 140)" opacity={0.85}>
            <path d="M 0 -18 L 24 0 L 0 18 Z M 24 -18 L 48 0 L 24 18 Z" fill={KRP.white} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          </g>
        )}
        {/* 小机のトランプ (ひとり遊びの列が増えていく) */}
        {Array.from({ length: Math.max(cards, up ? 8 : 0) }, (_, i) => (
          <g key={i} transform={`translate(${1380 + (i % 4) * 40} ${712 + Math.floor(i / 4) * 16}) rotate(${(i % 3) * 4 - 4})`}>
            <rect x={-16} y={-22} width={32} height={44} rx={4} fill={KRP.white} stroke={C.ink} strokeWidth={3} transform="scale(1 0.5)" />
            <circle cx={0} cy={-2} r={4} fill={i % 2 ? KRP.red : C.ink} />
          </g>
        ))}
        {!up ? (
          <g>
            <Person x={1180} y={900} s={1} f={f} face={face} pose="sit" cloth={KU_COAT} clothDark={KU_COAT_D} hair="cap" gaze={[2, 1]} />
            <MzGcKUOverlay x={1180} y={900} f={f} scarf={f >= 38} />
            {yawn && <path d="M 1150 640 q -20 -20 0 -36" stroke={C.ink} strokeWidth={4} fill="none" />}
            <MzGcChairSeat />
            {/* 紅茶 (おかわりで湯気) */}
            <g transform="translate(1282 830)">
              <path d="M -22 -30 L -18 4 Q 0 12 18 4 L 22 -30 Z" fill={C.tea} stroke={C.ink} strokeWidth={4} />
              <ellipse cx={0} cy={6} rx={30} ry={7} fill={C.tea} stroke={C.ink} strokeWidth={3.5} />
              <ellipse cx={0} cy={-30} rx={22} ry={5} fill="#8A5A2E" stroke={C.ink} strokeWidth={3} />
            </g>
          </g>
        ) : f < 106 ? (
          <g>
            <MzGcChairSeat />
            <KnockerUp x={kx} y={900} s={1} f={f} pose="walk" face="smile" />
            {/* 立ち上がりの早業の線 */}
            {f < 48 && (
              <g stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - seg(f, 40, 48)}>
                {[-1, 1].map((sd) => [0, 1, 2].map((i) => (
                  <line key={`${sd}${i}`} x1={1180 + sd * (120 + i * 16)} y1={640 + i * 70} x2={1180 + sd * (170 + i * 16)} y2={630 + i * 70} />
                )))}
              </g>
            )}
          </g>
        ) : (
          <KnockerUp x={2330} y={900} s={1} f={f} pose="knock" face="smile" tip={[2465, 410]} />
        )}
        {/* 飛んでくる山高帽とマフラー */}
        {fly > 0 && fly < 1 && (
          <g>
            <MzGcBowler x={lerp(770, 1180, fly)} y={lerp(378, 632, fly) - Math.sin(fly * Math.PI) * 160} s={0.8 + 0.2 * fly} rot={fly * 360} />
            <path d={`M ${lerp(840, 1150, fly)} ${lerp(400, 730, fly) - Math.sin(fly * Math.PI) * 120} q 30 -20 60 0 q 30 20 60 0`} stroke="#C8372B" strokeWidth={20} fill="none" strokeLinecap="round" />
          </g>
        )}
        {/* コンコン */}
        {f >= 112 && (
          <g opacity={0.5 + 0.5 * Math.sin(f / 2)}>
            <text x={2540} y={300} fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.white} stroke={C.ink} strokeWidth={3} paintOrder="stroke">コン</text>
          </g>
        )}
      </g>
      {/* 札 (画面に固定) */}
      <g opacity={1 - seg(f, 62, 72)}>
        <TagPlate x={1480} y={170} text="3時" size={60} t={seg(f, 34, 40)} color={KRP.red} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #161 寝なければ、寝坊はしません。完璧な作戦です。
// 格: 山 / seed 6161
// 絵: どこ: MachiNami (sky=0.3) の通りのガス灯の下 (夜明け前)。演出: ★笑いどころ。仕事中の KnockerUp が、ガス灯の下でカメラに向かってくるっと振り向き、親指を立ててどや顔 (face="smile")。ところがその目の下には、真っ黒で巨大なクマ (目の下からあごまで届きそうな濃い隈) ができていて、まぶたは半分落ち、体がゆらゆら揺れている。背後のれんが壁には、彼の影が大きく映っていて、影の方は完全に立ったまま寝ている (影の頭から Zzz)。持っている棒の先が、ふらついてガス灯にこつんと当たる。どや顔のまま首ががくっと落ちて、はっと戻る。腕は2本 (pose="thumbsup" で片手は親指、片手は棒)。カメラは全身から顔へぐっと寄って、クマを見せる。動き: f0-30 振り向いて親指 / f30-60 寄ってクマを見せる / f60-90 影が Zzz / f90-110 棒がガス灯にこつん / f110-140 首ががくっ→はっ
// どこ: MachiNami (夜明け前 sky=0.3) の通り、ガス灯の下
// 演出: ★笑いどころ。仕事中のノッカー・アップがくるっとこちらを向き、親指を立ててどや顔。ところが目の下には
//       あごまで届きそうな真っ黒なクマ、まぶたは重く、体はゆらゆら。背後のれんが壁の大きな影は、立ったまま
//       ぐっすり寝ている (影から Zzz)。ふらついた棒の先がガス灯にこつん。どや顔のまま首ががくっ → はっ!
// 動き: f0-10 振り向く / f4-14 親指 / f10-34 顔へ寄ってクマを見せる / 影の Zzz ずっと / f52-62 棒がガス灯にこつん / f72-88 がくっ / f88-96 はっ
const Mz161: React.FC<{ f: number }> = ({ f }) => {
  const X = 700, Y = 900;
  const kz = easeInOut(seg(f, 10, 34));
  const sc = logLerp(1, 1.7, kz);
  const fx = lerp(960, 760, kz), fy = lerp(540, 640, kz);
  const turn = easeOut(seg(f, 0, 10));
  const hitK = Math.sin(seg(f, 50, 64) * Math.PI);
  const sway = Math.sin(f / 11) * 3 + hitK * 7;
  const drop = Math.sin(seg(f, 72, 88) * Math.PI / 2) * (1 - seg(f, 88, 93));
  const bob = Math.sin(f / 13) * 3;
  // 親指の手の位置 (Person の run の右腕 = 画面の左。dir=-1 で反転)
  // 棒の先 (KnockerUp walk の式と同じ) を sway で回す
  const T0: [number, number] = [925, 350];
  const rot = (p: [number, number], deg: number): [number, number] => {
    const a = (deg * Math.PI) / 180, dx = p[0] - X, dy = p[1] - Y;
    return [X + dx * Math.cos(a) - dy * Math.sin(a), Y + dx * Math.sin(a) + dy * Math.cos(a)];
  };
  const tip = rot(T0, sway);
  const bodyT = `rotate(${sway + drop * 7} ${X} ${Y}) translate(0 ${drop * 26})`;
  return (
    <Frame f={f} seed={6161} bg={MP.nightDeep} dark>
      <defs>
        <filter id="mzgc161shadow"><feColorMatrix type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.07  0 0 0 0 0.14  0 0 0 0.62 0" /></filter>
      </defs>
      <g transform={cam(sc, fx, fy)}>
        <MachiNami f={f} sky={0.3} windows={[1, 0, 0, 0, 0, 0]} />
        {/* 壁に映る大きな影 (立ったまま寝ている) */}
        <g filter="url(#mzgc161shadow)" transform={`translate(470 862) skewX(14) scale(1.45) rotate(${14 + Math.sin(f / 16) * 2}) translate(-470 -862)`}>
          <KnockerUp x={470} y={862} s={1} f={0} pose="walk" dir={-1} />
        </g>
        {[0, 1, 2].map((i) => {
          const t = ((f / 46 + i / 3) % 1);
          return <text key={i} x={560 + t * 70} y={420 - t * 150} fontFamily={FONT} fontWeight={900} fontSize={44 + t * 34}
            fill={KRP.white} stroke={C.ink} strokeWidth={3} paintOrder="stroke" opacity={Math.sin(t * Math.PI) * 0.9}>Z</text>;
        })}
        {/* 本人 (振り向いてどや顔)。Person + 上着の重ね + 山高帽。棒は下ろした右手で肩に立てかける */}
        <g transform={`translate(${X} 0) scale(${lerp(0.15, 1, turn)} 1) translate(${-X} 0)`}>
          <g transform={bodyT}>
            <MzGcPole B={[X + 50, Y - 4 + bob]} T={[T0[0], T0[1]]} />
            <Person x={X} y={Y} s={1} f={f} face="smile" pose="point" pointDir={-1} cloth={KU_COAT} clothDark={KU_COAT_D} hair="cap" />
            <MzGcKUOverlay x={X} y={Y} f={f} hem hat />
            {/* 棒を握る右手 */}
            <circle cx={X + 74} cy={Y - 66 + bob} r={14} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
            {/* 巨大なクマ (目の下からあごまで) と重いまぶた */}
            <g transform={`translate(${X} ${Y + bob})`}>
              {[-1, 1].map((sd) => (
                <g key={sd}>
                  <path d={`M ${sd * 8} -210 Q ${sd * 27} -202 ${sd * 48} -210 Q ${sd * 54} -184 ${sd * 44} -164 Q ${sd * 34} -152 ${sd * 24} -160 Q ${sd * 10} -184 ${sd * 8} -210 Z`}
                    fill={C.bruise} opacity={0.92} />
                  <path d={`M ${sd * 12} -196 Q ${sd * 28} -188 ${sd * 44} -196 M ${sd * 18} -180 Q ${sd * 30} -174 ${sd * 44} -180`} stroke="#7A6A94" strokeWidth={3} fill="none" />
                  <path d={`M ${sd * 5} -228 A 21 21 0 0 1 ${sd * 47} -228 Z`} fill={KRP.white} stroke="none" />
                  <path d={`M ${sd * 5} -228 L ${sd * 47} -228`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
                  <path d={`M ${sd * 8} -238 Q ${sd * 26} -246 ${sd * 44} -238`} stroke="#9A90A8" strokeWidth={3} fill="none" />
                </g>
              ))}
            </g>
            {/* 親指を立てた手 (左手) */}
            {seg(f, 4, 14) > 0 && (
              <g transform={`translate(${X - 160} ${Y - 150 + bob}) scale(${pop(seg(f, 4, 14))}) rotate(-6)`}>
                <rect x={-18} y={-14} width={34} height={32} rx={11} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
                <rect x={-8} y={-44} width={15} height={34} rx={7.5} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
                <path d="M -16 -2 L 12 -2 M -16 8 L 12 8" stroke={C.ink} strokeWidth={2.5} />
              </g>
            )}
            {/* きらーん (どや顔の歯) */}
            {f > 10 && f < 50 && <path d={`M ${X + 74} ${Y - 214 + bob} l 6 -12 l 6 12 l 12 6 l -12 6 l -6 12 l -6 -12 l -12 -6 Z`} fill={KRP.yellow} stroke={C.ink} strokeWidth={2} opacity={0.5 + 0.5 * Math.sin(f / 3)} />}
          </g>
        </g>
        {/* くるっ (振り向きの線) */}
        {f < 14 && (
          <g stroke={C.ink} strokeWidth={5} fill="none" opacity={1 - seg(f, 6, 14)} strokeLinecap="round">
            <path d={`M ${X - 150} 640 A 150 40 0 0 0 ${X + 150} 640`} />
            <path d={`M ${X - 130} 700 A 130 34 0 0 0 ${X + 130} 700`} />
          </g>
        )}
        {/* こつん (棒の先がガス灯に当たる) */}
        {f >= 56 && f < 70 && (
          <g transform={`translate(${tip[0]} ${tip[1]})`} opacity={1 - seg(f, 62, 70)}>
            {[0, 1, 2, 3, 4].map((i) => {
              const a = (i / 5) * Math.PI * 2 + 0.3;
              return <line key={i} x1={Math.cos(a) * 30} y1={Math.sin(a) * 30} x2={Math.cos(a) * 56} y2={Math.sin(a) * 56} stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round" />;
            })}
            <text x={40} y={-36} fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.white} stroke={C.ink} strokeWidth={3} paintOrder="stroke">コツン</text>
          </g>
        )}
        {/* はっ! */}
        {f >= 88 && f < 112 && (
          <g opacity={1 - seg(f, 104, 112)}>
            <text x={X + 90} y={430} fontFamily={FONT} fontWeight={900} fontSize={70} fill={KRP.red} stroke={C.ink} strokeWidth={4} paintOrder="stroke"
              transform={`rotate(10 ${X + 90} 430)`}>!</text>
            <path d={`M ${X + 74} 500 q -8 14 0 22 q 8 -8 0 -22 Z`} fill="#9FD2F0" stroke={C.ink} strokeWidth={3} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #162 では、ちゃんと寝ていたノッカー・アップは、どうしたのか。
// 格: 並 / seed 6162
// 絵: どこ: MachiNami (sky=0) の長屋の別の一軒の寝室。演出: #158 と同じ構図の寝室で、今度は本当に KnockerUp (pose="sleep") が布団をかぶってすやすや寝ている (クマなし・幸せそうな寝顔)。窓辺に棒、壁の釘に山高帽。カメラがベッドの頭のほうの暗がりへ寄ると、ナイトテーブルの上に、何か四角い影 (布をかぶせられた物。ベルのような2つのでっぱりが布越しに分かる) が置いてある。その影の上に小さな「?」。寝ている本人の Zzz の泡と、布の影の「?」が交互にぷかぷか。腕は2本 (pose="sleep")。動き: f0-50 寝室全景 / f50-110 ナイトテーブルの影へ寄る / 「?」と Zzz が交互 / 布のすそが小さく揺れる
// どこ: 長屋の別の一軒 (緑がかった壁紙) の2階の寝室。窓辺に棒・壁の釘に山高帽・ナイトテーブル
// 演出: 今度は本当にノッカー・アップがつぎはぎの布団ですやすや (クマなし・ほっぺが赤い幸せな寝顔)。
//       カメラが頭のほうの暗がりへ寄ると、ナイトテーブルの上に布をかぶせた四角い物 (上に2つのでっぱり=ベルの形)。
//       その上に小さな「?」。寝息の Zzz と「?」が交互にぷかぷか。布のすそが小さく震える
// 動き: f0-14 寝室全景 / f14-40 ナイトテーブルへ寄る / 「?」と Zzz が交互 / 布のすそが小さく揺れる
// 布をかぶせた目覚まし時計 (中は見せない。上に2つのベルのでっぱり)。x,y = 底の中心
const MzGcShrouded: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const q = Math.sin(f * 1.7) * 1.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={92} ry={12} fill="#000" opacity={0.25} />
      <path d={`M -84 0 Q -88 -60 -70 -96 Q -78 -128 -50 -134 Q -30 -136 -24 -118 Q 0 -128 24 -118 Q 30 -136 50 -134 Q 78 -128 70 -96 Q 88 -60 84 0
        Q 60 ${-8 + q} 40 ${2 - q} Q 20 ${-6 + q} 0 ${2 - q} Q -20 ${-6 + q} -40 ${2 - q} Q -60 ${-8 + q} -84 0 Z`}
        fill="#E6DCC6" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* 布のしわ・ハンマーのでっぱり */}
      <path d="M -50 -120 Q -44 -80 -56 -20 M 50 -120 Q 44 -80 56 -20 M 0 -118 Q 4 -70 -4 -10" stroke="#BFB197" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M -8 -122 Q 0 -146 8 -122" stroke={C.ink} strokeWidth={5} fill="#E6DCC6" />
      {/* 布の縁の刺しゅう */}
      <path d="M -80 -10 Q 0 -20 80 -10" stroke="#B86A5A" strokeWidth={4} strokeDasharray="8 6" fill="none" />
    </g>
  );
};
const Mz162: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 14, 40));
  const sc = logLerp(1, 2.15, k);
  const fx = lerp(960, 840, k), fy = lerp(540, 600, k);
  const BX = 1180, BY = 640, BS = 1.05;
  const NX = 730, NY = 712;
  return (
    <Frame f={f} seed={6162} bg={MP.nightDeep} dark>
      <g transform={cam(sc, fx, fy)}>
        {/* 壁 (緑がかった色あせた壁紙・ひし形の柄) */}
        <rect x={-40} y={-60} width={2000} height={760} fill="#93A68E" />
        <g stroke="#829880" strokeWidth={4} opacity={0.8}>
          {Array.from({ length: 26 }, (_, i) => <line key={i} x1={-40 + i * 80} y1={-60} x2={-40 + i * 80 + 380} y2={700} />)}
          {Array.from({ length: 26 }, (_, i) => <line key={`b${i}`} x1={-420 + i * 80} y1={700} x2={-40 + i * 80} y2={-60} />)}
        </g>
        <rect x={-40} y={-60} width={2000} height={36} fill={MP.woodDark} stroke={C.ink} strokeWidth={5} />
        <rect x={-40} y={600} width={2000} height={100} fill={MP.woodDark} stroke={C.ink} strokeWidth={5} />
        <rect x={-40} y={594} width={2000} height={12} fill={MP.wood} stroke={C.ink} strokeWidth={4} />
        <rect x={-40} y={700} width={2000} height={420} fill="#8E6644" stroke={C.ink} strokeWidth={5} />
        <g stroke="#73502F" strokeWidth={4}>{[770, 860, 970].map((ly) => <line key={ly} x1={-40} y1={ly} x2={1960} y2={ly} />)}</g>
        {/* 窓 (外は夜の通り・向かいの家の屋根) と棒 */}
        <rect x={1290} y={140} width={260} height={320} fill="#F1EADF" stroke={C.ink} strokeWidth={7} />
        <rect x={1306} y={156} width={228} height={288} fill="#1E2440" />
        <path d="M 1306 380 L 1360 330 L 1420 370 L 1480 320 L 1534 360 L 1534 444 L 1306 444 Z" fill="#141830" />
        <circle cx={1360} cy={210} r={22} fill="#FFF3C8" />
        <path d="M 1306 300 L 1534 300 M 1420 156 L 1420 444" stroke="#F1EADF" strokeWidth={8} />
        <rect x={1276} y={452} width={288} height={18} rx={4} fill="#F1EADF" stroke={C.ink} strokeWidth={5} />
        <MzGcPole B={[1600, 760]} T={[1574, 40]} s={1.15} />
        {/* 壁の釘の山高帽 */}
        <MzGcNail x={1720} y={300} />
        <MzGcBowler x={1720} y={346} s={0.8} rot={5} />
        {/* ナイトテーブルと、布をかぶせた物 */}
        <rect x={NX - 90} y={NY} width={180} height={22} rx={5} fill={MP.woodLight} stroke={C.ink} strokeWidth={6} />
        <rect x={NX - 78} y={NY + 20} width={156} height={118} fill={MP.wood} stroke={C.ink} strokeWidth={6} />
        <rect x={NX - 64} y={NY + 34} width={128} height={40} rx={5} fill={MP.woodLight} stroke={C.ink} strokeWidth={4} />
        <circle cx={NX} cy={NY + 54} r={7} fill={MP.brass} stroke={C.ink} strokeWidth={3} />
        <MzGcShrouded x={NX} y={NY} s={0.95} f={f} />
        {/* ベッドと、本当に寝ているノッカー・アップ */}
        <MzGcBed id="mzgc162q" x={BX} y={BY} s={BS} f={f} />
        {/* 幸せな寝顔 (ほっぺ) */}
        {[-1, 1].map((sd) => <ellipse key={sd} cx={BX - 200 * BS} cy={BY + sd * 40 * BS} rx={9} ry={13} fill="#F2A7A0" opacity={0.75} />)}
        {/* 部屋の暗さと、窓からの月明かり */}
        <rect x={-40} y={-60} width={2000} height={1180} fill={MP.nightDeep} opacity={0.36} />
        <polygon points="1306,460 1534,460 1700,1120 1000,1120" fill="#C9D6F2" opacity={0.08} />
        {/* 「?」(布の物の上) と Zzz が交互に */}
        {[0, 1, 2].map((i) => {
          const t = ((f / 54 + i / 3) % 1);
          const on = Math.sin(t * Math.PI);
          return <text key={i} x={NX - 14 + Math.sin(t * 7 + i) * 8} y={NY - 150 - t * 90} fontFamily={FONT} fontWeight={900} fontSize={40 + t * 22}
            fill={KRP.red} stroke={C.ink} strokeWidth={3} paintOrder="stroke" opacity={on * (0.5 + 0.5 * Math.cos(f / 9))}>?</text>;
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #163 イギリスのボルトンという町に、72歳のノッカー・アップがいました。
// 格: 山 / seed 6163
// 絵: どこ: ボルトンの町の夜明け前の通り (MachiNami と同じ部品の長屋だが、遠くに綿工場の煙突が何本も並ぶ)。地名札「ボルトン」と数字札「72歳」。演出: 霧の中から、KnockerUp (old=true: 白髪・白い口ひげ・少し腰の曲がった老人。黒い山高帽・長い灰色のコート・赤いマフラー) が、長い棒を杖がわりにもしながら、ゆっくり歩いてくる。こつ、こつ、と棒が石畳を打つ。窓の前で立ち止まると、曲がった腰をぐいっと伸ばし、棒を高く掲げて2階の窓をコンコン。そのときだけ背筋がしゃんとする (face="smile")。窓に明かりがつく。腕は2本 (pose="knock" で両手で棒)。カメラは霧の中の遠景から、老人の全身へ寄る。動き: f0-60 霧から歩いてくる・寄る / f60-90 腰を伸ばす / f90-120 コンコン・窓に明かり / 白い息
// どこ: ボルトンの町の夜明け前の通り (MachiNami。屋根の向こうに綿工場の細い煙突がたくさん並ぶ)。札「ボルトン」(英国旗つき)「72歳」
// 演出: 朝もやの中から、白髪・白い口ひげ・少し腰の曲がった老ノッカー・アップが棒をかついでゆっくり歩いてくる (こつ、こつ)。
//       3軒目の窓の前で立ち止まり、曲がった腰をぐいっと伸ばして (背筋しゃん)、棒を高く掲げて2階の窓をコンコン → 窓に明かり。
//       吐く息が白い
// 動き: f0-34 もやから歩いてくる・カメラが遠景から寄る / f8-24 札 / f34-46 腰を伸ばす / f46- コンコン / f62 窓に明かり / 白い息
const MzGcUnionJack: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 96 }) => {
  const h = w / 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs><clipPath id="mzgcUJ"><rect x={0} y={0} width={w} height={h} /></clipPath></defs>
      <g clipPath="url(#mzgcUJ)">
        <rect x={0} y={0} width={w} height={h} fill="#22408C" />
        <path d={`M 0 0 L ${w} ${h} M ${w} 0 L 0 ${h}`} stroke={KRP.white} strokeWidth={h * 0.22} />
        <path d={`M 0 0 L ${w} ${h} M ${w} 0 L 0 ${h}`} stroke="#C8202E" strokeWidth={h * 0.08} />
        <path d={`M ${w / 2} 0 L ${w / 2} ${h} M 0 ${h / 2} L ${w} ${h / 2}`} stroke={KRP.white} strokeWidth={h * 0.34} />
        <path d={`M ${w / 2} 0 L ${w / 2} ${h} M 0 ${h / 2} L ${w} ${h / 2}`} stroke="#C8202E" strokeWidth={h * 0.2} />
      </g>
      <rect x={0} y={0} width={w} height={h} fill="none" stroke={C.ink} strokeWidth={4} />
    </g>
  );
};
const Mz163: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 34));
  const sc = logLerp(1, 1.5, k);
  const fx = lerp(960, 600, k), fy = lerp(540, 640, k);
  const walkK = easeOut(seg(f, 0, 34));
  const X = lerp(150, 520, walkK), Y = 902, S = 0.95;
  const straight = easeOut(seg(f, 34, 46));
  const knocking = f >= 44;
  const [wx, wy] = MACHI_WIN[2];
  const mist = 1 - 0.65 * seg(f, 0, 40);
  return (
    <Frame f={f} seed={6163} bg={MP.nightDeep} dark>
      <g transform={cam(sc, fx, fy)}>
        <MachiNami f={f} sky={0.55} windows={[0, 0, seg(f, 60, 66), 0, 0.0, 0]} />
        {/* 屋根の向こうの綿工場の煙突 (たくさん) */}
        {[110, 190, 450, 520, 790, 1100, 1170, 1440, 1760, 1840].map((cx, i) => (
          <g key={cx}>
            {[0, 1, 2].map((j) => {
              const t = ((f / 140 + j / 3 + i * 0.17) % 1);
              return <circle key={j} cx={cx + t * 110} cy={-30 + (i % 3) * 18 - t * 90} r={12 + t * 34} fill="#8C8794" opacity={(1 - t) * 0.4} />;
            })}
            <rect x={cx - 11} y={-40 + (i % 3) * 18} width={22} height={192 - (i % 3) * 18} fill="#5E6478" stroke={C.ink} strokeWidth={3} />
            <rect x={cx - 14} y={-44 + (i % 3) * 18} width={28} height={10} fill="#4C5266" stroke={C.ink} strokeWidth={2.5} />
          </g>
        ))}
        {/* 老ノッカー・アップ */}
        <g transform={`rotate(${-8 * straight} ${X} ${Y})`}>
          {knocking ? (
            <KnockerUp x={X} y={Y} s={S} f={f} pose="knock" old face="smile" tip={[wx - 8, wy + 50]} />
          ) : (
            <KnockerUp x={X} y={Y} s={S} f={f} pose="walk" old face="normal" />
          )}
        </g>
        {/* 背筋しゃん! の線 */}
        {straight > 0.1 && f < 60 && (
          <g stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - seg(f, 50, 60)}>
            <path d={`M ${X - 120} ${Y - 300} l -20 -14 M ${X - 130} ${Y - 250} l -26 -2 M ${X + 120} ${Y - 300} l 20 -14`} />
          </g>
        )}
        {/* こつ、こつ (歩くたびに石畳) */}
        {f < 36 && Math.floor(f / 9) % 2 === 0 && (
          <text x={X + 30} y={Y + 10} fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.white} stroke={C.ink} strokeWidth={2.5} paintOrder="stroke" opacity={0.85}>こつ</text>
        )}
        {/* 白い息 */}
        {[0, 1].map((i) => {
          const t = ((f / 30 + i / 2) % 1);
          const mx = X + (knocking ? 26 : 30) + t * 60, my = Y - 190 * S - t * 50;
          return <ellipse key={i} cx={mx} cy={my} rx={10 + t * 26} ry={7 + t * 14} fill={KRP.white} opacity={(1 - t) * 0.55} />;
        })}
        {/* 朝もや (はじめ濃く、寄ると薄く) */}
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={((f * (0.8 + i * 0.3) + i * 520) % 2600) - 300} cy={620 + i * 90} rx={520} ry={110}
            fill={MP.mist} opacity={0.22 * mist} />
        ))}
        <rect x={-40} y={-60} width={2000} height={1200} fill={MP.mist} opacity={0.16 * mist} />
      </g>
      {/* 札 (左端をそろえて縦に積む) */}
      <MzGcUnionJack x={100} y={122} w={88} />
      <TagPlate x={312} y={168} text="ボルトン" size={44} t={seg(f, 8, 18)} />
      <TagPlate x={302} y={262} text="72歳" size={52} t={seg(f, 14, 24)} color={KRP.red} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #164 この道53年。毎朝3時45分に起きる、大ベテランです。
// 格: 山 / seed 6164
// 絵: どこ: ボルトンの老ノッカー・アップの家の寝室 (古い木のベッド・つぎはぎの布団・壁の釘に山高帽と赤いマフラー・窓辺に年季の入った棒)。数字札「53年」「3時45分」。演出: 壁に、使い古されてすり減った棒の先の房が、何本も束になって釘に掛かっている (53年ぶん、房が積み重なった見立て。多すぎて壁からはみ出しそう)。壁の掛け時計が3時45分を指した瞬間、ベッドの KnockerUp (old=true) がぱちっと目を開け (face="smile")、慣れた手つきで山高帽をかぶり、マフラーを巻き、棒をつかむまでを一息で (動きに無駄がない、早業)。ただ、起き上がる前にナイトテーブルの上の布をかぶった四角い物 (#162 と同じ影) にちらっと手を伸ばす (中は次の文まで見せない)。腕は2本 (pose="walk" で片手に帽子、片手で棒)。カメラは房の束の壁から、時計へパンして、ベッドへ寄る。動き: f0-50 房の束の壁をパン / f50 3時45分 / f50-80 目を開ける / f80-130 早業の身支度・布の物に手を伸ばす
// どこ: ボルトンの老ノッカー・アップの寝室 (古い木のベッド・つぎはぎの布団・壁の釘に山高帽とコートと赤いマフラー・窓辺に年季の入った棒)
// 演出: 壁一面に、すり減った棒の先の房が釘ごとに束になって掛かっている (53年ぶん。多すぎて床にもあふれる)。
//       掛け時計が3時45分を指した瞬間、老人がぱちっと目を開け、まず布をかぶせた枕元の物にちらっと手を伸ばす
//       (中は見せない)。次の瞬間には早業で山高帽・コート・マフラー・棒まで身支度を終えて立っている。札「53年」「3時45分」
// 動き: f0-22 房の壁をパン / f22-30 時計が3時45分 / f30-40 ベッドへ寄る・目がぱちっ / f36-52 布の物に手を伸ばす / f54-62 早業の身支度 → 立つ
// 老人の寝室 (#164・#166・#167)。世界座標。床は y=700 から。ベッドの足元 (OLD_BED) に寝る
const OLD_BED = [1240, 600] as const;
const OLD_NIGHT = [730, 690] as const;
const MzGcOldRoom: React.FC<{ f: number; min: number; hatOn?: boolean; coatOn?: boolean; poleOn?: boolean; tassels?: boolean; dim?: number; hatShake?: number }> = ({
  f, min, hatOn = true, coatOn = true, poleOn = true, tassels = true, dim = 0.3, hatShake = 0,
}) => {
  const [nx, ny] = OLD_NIGHT;
  return (
    <g>
      {/* 壁 (青みがかった古い壁紙・はがれたところ) */}
      <rect x={-300} y={-300} width={2600} height={1000} fill="#A7A99E" />
      <g fill="#9A9C90">{Array.from({ length: 34 }, (_, i) => <rect key={i} x={-300 + i * 80} y={-300} width={24} height={1000} />)}</g>
      <path d="M 1160 120 L 1230 100 L 1250 170 L 1190 200 Z" fill="#C9BFA4" stroke={C.ink} strokeWidth={3} />
      <path d="M 1620 520 L 1680 500 L 1690 560 Z" fill="#C9BFA4" stroke={C.ink} strokeWidth={3} />
      <rect x={-300} y={-300} width={2600} height={40} fill={MP.woodDark} stroke={C.ink} strokeWidth={5} />
      <rect x={-300} y={590} width={2600} height={110} fill={MP.woodDark} stroke={C.ink} strokeWidth={5} />
      <rect x={-300} y={584} width={2600} height={12} fill={MP.wood} stroke={C.ink} strokeWidth={4} />
      <rect x={-300} y={700} width={2600} height={600} fill="#8A6446" stroke={C.ink} strokeWidth={5} />
      <g stroke="#6E4C30" strokeWidth={4}>{[770, 860, 970, 1100].map((ly) => <line key={ly} x1={-300} y1={ly} x2={2300} y2={ly} />)}</g>
      <ellipse cx={1240} cy={900} rx={380} ry={60} fill="#5E6E8A" stroke={C.ink} strokeWidth={6} />
      <ellipse cx={1240} cy={900} rx={330} ry={42} fill="none" stroke="#9AAAC4" strokeWidth={5} strokeDasharray="14 10" />
      {/* 53年ぶんの房 (釘ごとに束で。多すぎて床にもあふれる) */}
      {tassels && (
        <g>
          {Array.from({ length: 4 }, (_, r) => Array.from({ length: 7 }, (_, c) => {
            const px = -20 + c * 88 + (r % 2) * 40, py = 40 + r * 140;
            return (
              <g key={`${r}-${c}`}>
                {[0, 1, 2].map((k) => (
                  <g key={k} transform={`rotate(${(k - 1) * 16 + Math.sin(f / 23 + r + c) * 2} ${px} ${py})`}>
                    <rect x={px - 6} y={py + 2} width={12} height={22} fill={MP.iron} stroke={C.ink} strokeWidth={2.5} />
                    {[-14, -7, 0, 7, 14].map((d) => (
                      <path key={d} d={`M ${px + d * 0.3} ${py + 22} q ${d * 0.6} 30 ${d * 1.1 + rnd(r * 7 + c, d + k) * 8 - 4} ${56 + rnd(c, d + k * 3) * 30}`}
                        stroke={rnd(r + k, c + d) > 0.5 ? MP.ironLight : "#8E9198"} strokeWidth={3} fill="none" strokeLinecap="round" />
                    ))}
                  </g>
                ))}
                <MzGcNail x={px} y={py} />
              </g>
            );
          }))}
          {/* 入りきらない房を詰めた木箱 (床) */}
          <g>
            {Array.from({ length: 9 }, (_, i) => (
              <g key={i} transform={`rotate(${-40 + i * 10} ${130 + i * 34} 720)`}>
                <rect x={124 + i * 34} y={650} width={12} height={22} fill={MP.iron} stroke={C.ink} strokeWidth={2.5} />
                {[-10, 0, 10].map((d) => <path key={d} d={`M ${130 + i * 34} 650 q ${d * 0.6} -26 ${d * 1.2} -48`} stroke={MP.ironLight} strokeWidth={3} fill="none" strokeLinecap="round" />)}
              </g>
            ))}
            <rect x={100} y={690} width={340} height={120} rx={6} fill={MP.wood} stroke={C.ink} strokeWidth={6} />
            <path d="M 100 730 L 440 730 M 100 770 L 440 770" stroke={MP.woodDark} strokeWidth={4} />
          </g>
        </g>
      )}
      {/* 丸い掛け時計 */}
      <g transform="translate(740 220)">
        <line x1={0} y1={-86} x2={0} y2={-120} stroke={C.ink} strokeWidth={3} />
        <circle cx={0} cy={-122} r={6} fill={MP.brass} stroke={C.ink} strokeWidth={2.5} />
        <circle r={92} fill={MP.wood} stroke={C.ink} strokeWidth={7} />
        <MzGcDial r={76} min={min} />
        <path d="M -52 -40 Q -32 -62 -4 -66" stroke={KRP.white} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.5} />
      </g>
      {/* 窓 (外は夜明け前の通り) */}
      <rect x={1330} y={150} width={240} height={300} fill="#F1EADF" stroke={C.ink} strokeWidth={7} />
      <rect x={1346} y={166} width={208} height={268} fill="#26304E" />
      <circle cx={1500} cy={330} r={46} fill={MP.glow} opacity={0.2} />
      <path d="M 1346 300 L 1554 300 M 1450 166 L 1450 434" stroke="#F1EADF" strokeWidth={8} />
      <rect x={1316} y={444} width={268} height={18} rx={4} fill="#F1EADF" stroke={C.ink} strokeWidth={5} />
      {poleOn && <MzGcPole B={[1614, 770]} T={[1590, 20]} s={1.15} />}
      {/* 釘: 山高帽・灰色のコート・赤いマフラー */}
      <rect x={1660} y={250} width={260} height={22} rx={4} fill={MP.wood} stroke={C.ink} strokeWidth={4} />
      {[1700, 1790, 1870].map((px) => <circle key={px} cx={px} cy={276} r={8} fill={MP.brass} stroke={C.ink} strokeWidth={3} />)}
      {coatOn && (
        <g>
          <path d="M 1760 280 L 1820 280 L 1850 600 L 1730 600 Z" fill={KU_COAT} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M 1790 290 L 1790 600 M 1772 300 L 1790 340 L 1808 300" stroke={KU_COAT_D} strokeWidth={5} fill="none" />
          {[380, 440, 500].map((by) => <circle key={by} cx={1790} cy={by} r={6} fill={MP.brass} stroke={C.ink} strokeWidth={2.5} />)}
          <path d="M 1862 282 Q 1852 380 1860 470 L 1884 470 Q 1882 380 1882 282 Z" fill="#C8372B" stroke={C.ink} strokeWidth={4} />
          <path d="M 1862 462 l 0 14 M 1872 464 l 0 14 M 1882 462 l 0 14" stroke={C.ink} strokeWidth={3} />
        </g>
      )}
      {hatOn && <MzGcBowler x={1700 + hatShake * 2} y={322} s={0.8} rot={-4 + hatShake * 4} />}
      {/* ナイトテーブル */}
      <rect x={nx - 90} y={ny} width={180} height={22} rx={5} fill={MP.woodLight} stroke={C.ink} strokeWidth={6} />
      <rect x={nx - 78} y={ny + 20} width={156} height={120} fill={MP.wood} stroke={C.ink} strokeWidth={6} />
      <rect x={nx - 64} y={ny + 34} width={128} height={40} rx={5} fill={MP.woodLight} stroke={C.ink} strokeWidth={4} />
      <circle cx={nx} cy={ny + 54} r={7} fill={MP.brass} stroke={C.ink} strokeWidth={3} />
      {/* 夜の暗さ (部屋だけ) */}
      <rect x={-300} y={-300} width={2600} height={1600} fill={MP.nightDeep} opacity={dim} />
    </g>
  );
};
// 寝ている頭の上に「ぱちっ」と開いた目を描く (KnockerUp sleep の頭の位置)
const MzGcOpenEyes: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  if (t <= 0) return null;
  return (
    <g>
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${x - 222 * s} ${y + sd * 24 * s}) scale(${s})`}>
          <ellipse cx={0} cy={0} rx={22} ry={18 * t} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          <circle cx={-4} cy={0} r={8 * t} fill={C.ink} />
          <circle cx={-6} cy={-3} r={2.5 * t} fill={KRP.white} />
        </g>
      ))}
    </g>
  );
};
const Mz164: React.FC<{ f: number }> = ({ f }) => {
  const k1 = easeInOut(seg(f, 0, 22));
  const k2 = easeInOut(seg(f, 22, 40));
  const sc = k2 > 0 ? logLerp(1.7, 1.25, k2) : 1.7;
  const fx = k2 > 0 ? lerp(480, 900, k2) : lerp(240, 480, k1);
  const fy = k2 > 0 ? lerp(300, 520, k2) : lerp(330, 300, k1);
  const min = 3 * 60 + 44 + seg(f, 22, 30) + Math.max(0, f - 30) / 60;
  const [bx, by] = OLD_BED;
  const [nx, ny] = OLD_NIGHT;
  const dressed = f >= 56;
  const eyes = seg(f, 30, 33);
  const reach = easeOut(seg(f, 36, 46)) * (1 - easeInOut(seg(f, 50, 55)));
  const hand: [number, number] = [lerp(bx - 140, nx + 30, reach), lerp(by - 30, ny - 90, reach) - Math.sin(reach * Math.PI) * 60];
  return (
    <Frame f={f} seed={6164} bg={MP.nightDeep}>
      <g transform={cam(sc, fx, fy)}>
        <MzGcOldRoom f={f} min={min} hatOn={!dressed} coatOn={!dressed} poleOn={!dressed} />
        <MzGcShrouded x={nx} y={ny} s={0.95} f={f} />
        {!dressed ? (
          <g>
            <MzGcBed id="mzgc164q" x={bx} y={by} s={1} f={f} old arms={reach <= 0} />
            <MzGcOpenEyes x={bx} y={by} t={eyes} />
            {eyes > 0 && f < 44 && (
              <g stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round" opacity={1 - seg(f, 38, 44)}>
                {[-50, -20, 10, 40].map((a) => <line key={a} x1={bx - 222} y1={by - 70} x2={bx - 222 + a * 0.6} y2={by - 120} transform={`rotate(${a * 0.3} ${bx - 222} ${by})`} />)}
              </g>
            )}
            {/* 布の物へ伸びる手 (寝間着の袖) */}
            {reach > 0 && (
              <g>
                <path d={`M ${bx - 150} ${by - 50} Q ${bx - 250} ${by - 230} ${hand[0]} ${hand[1]}`} stroke={C.ink} strokeWidth={30} fill="none" strokeLinecap="round" />
                <path d={`M ${bx - 150} ${by - 50} Q ${bx - 250} ${by - 230} ${hand[0]} ${hand[1]}`} stroke="#E9E3D4" strokeWidth={21} fill="none" strokeLinecap="round" />
                <circle cx={hand[0]} cy={hand[1]} r={15} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
              </g>
            )}
          </g>
        ) : (
          <g>
            <MzGcBed id="mzgc164q2" x={bx} y={by} s={1} f={f} who="none" quiltLift={-40} />
            <KnockerUp x={1430} y={800} s={1} f={f} pose="walk" old face="smile" />
            {/* 早業の線とほこり */}
            {f < 74 && (
              <g opacity={1 - seg(f, 60, 74)}>
                {[0, 1, 2, 3].map((i) => <line key={i} x1={1000 + i * 30} y1={520 + i * 40} x2={1280 + i * 20} y2={520 + i * 40} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />)}
                {[0, 1, 2].map((i) => <circle key={`d${i}`} cx={1380 + i * 50} cy={790 - i * 6} r={18 + seg(f, 56, 70) * 22} fill={KRP.white} opacity={0.5} />)}
              </g>
            )}
          </g>
        )}
      </g>
      {/* 札 (左端をそろえて縦に積む) */}
      <TagPlate x={208} y={170} text="53年" size={52} t={seg(f, 6, 16)} />
      <TagPlate x={260} y={262} text="3時45分" size={52} t={seg(f, 30, 36)} color={KRP.red} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #165 その写真の説明には、こう残っています。
// 格: 並 / seed 6165
// 絵: どこ: 古い資料室の木の机の上。緑の笠の電気スタンド・資料箱・虫めがね・白い手袋。机の真ん中に、厚紙の台紙に貼られたセピア色の古い写真 (画面の短辺の2/3の大きさ)。写真の中は #163〜#164 と同じボルトンの石畳の朝で、KnockerUp (pose="walk", old=true, face="smile") の白髪・白い口ひげ・少し曲がった腰の老人が長い棒を肩にかついで立つ。演出: 写真の下の余白に、手書きの説明書きの行 (字は読めない波線3行だけ。字幕と同じ文は書かない)。白い手袋の手 (腕は2本 pose で描く。片手で写真の角を押さえ、片手で虫めがねを持つ) が虫めがねを写真から説明書きへ滑らせる。説明書きの3行目の端が、虫めがねの中で大きくゆがんで、小さな目覚まし時計の落書きのような形が一瞬見えかける (次の文への予告。はっきりは見せない)。動き: f0-30 カメラが写真全体から説明書きへ下へパンしつつ寄る / f30-70 虫めがねが左から右へ滑る / f70-90 3行目で虫めがねが止まり、写真の中の老人がほんの少しまばたき / スタンドの光がゆらっ
// どこ:
// どこ: 古い資料室の木の机 (真上から)。緑の笠のスタンド・資料箱・索引カード・鉛筆。真ん中に台紙つきのセピアの写真
// 演出: 写真の中はボルトンの石畳の朝と、棒を肩にかついだ老ノッカー・アップ。下の余白に読めない手書きの3行。
//       白い手袋の両手 (左手は台紙の角を押さえ、右手は虫めがね) が説明書きをなぞる。3行目の端で
//       虫めがねの中に小さな目覚まし時計の落書きが一瞬ゆがんで見えかける (次の文の予告)
// 動き: f0-30 引きから説明書きへ下へパンしつつ寄る / f22-70 虫めがねが左→右 / f70-90 3行目で止まり、写真の老人がまばたき / スタンドの光がゆらっ
const MZGC_PHOTO = { w: 640, h: 560 } as const;
// セピアの写真の中身 (左上 0,0 / 640×560)。#165 と #166 で同じ写真を使う
const MzGcBoltonPhoto: React.FC<{ f: number; blink?: boolean; sepia?: number }> = ({ f, blink = false, sepia = 1 }) => {
  const clip = "mzgcBoltonClip";
  return (
    <g>
      <defs><clipPath id={clip}><rect x={0} y={0} width={MZGC_PHOTO.w} height={MZGC_PHOTO.h} /></clipPath></defs>
      <g clipPath={`url(#${clip})`} style={{ isolation: "isolate" }}>
        {/* 空 (朝もや) */}
        <rect x={0} y={0} width={640} height={560} fill="#D9CDB8" />
        {/* 遠くの綿工場の煙突 */}
        {[60, 150, 470, 560].map((cx, i) => (
          <g key={cx}>
            <rect x={cx - 9} y={30 + (i % 2) * 20} width={18} height={130} fill="#8C8070" />
            <circle cx={cx + 20} cy={20 + (i % 2) * 20} r={18 + Math.sin(f / 20 + i) * 2} fill="#B3A794" opacity={0.6} />
          </g>
        ))}
        {/* 長屋 (れんが) */}
        <rect x={0} y={120} width={640} height={300} fill="#9A7A5E" />
        <path d="M 0 120 L 640 120 L 640 104 L 0 104 Z" fill="#6E5E52" stroke={C.ink} strokeWidth={3} />
        <g stroke="#7E604A" strokeWidth={2} opacity={0.6}>
          {Array.from({ length: 14 }, (_, r) => <line key={r} x1={0} y1={130 + r * 20} x2={640} y2={130 + r * 20} />)}
        </g>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={40 + i * 210} y={150} width={70} height={90} fill="#4E4034" stroke={C.ink} strokeWidth={3} />
            <path d={`M ${75 + i * 210} 150 L ${75 + i * 210} 240 M ${40 + i * 210} 195 L ${110 + i * 210} 195`} stroke="#E8DCC4" strokeWidth={3} />
            <rect x={130 + i * 210} y={270} width={56} height={150} fill="#4A3C32" stroke={C.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 歩道と石畳 */}
        <rect x={0} y={420} width={640} height={30} fill="#A89A88" stroke={C.ink} strokeWidth={3} />
        <rect x={0} y={450} width={640} height={110} fill="#857766" />
        {Array.from({ length: 3 }, (_, r) => Array.from({ length: 12 }, (_, c) => (
          <rect key={`${r}-${c}`} x={-20 + c * 58 + (r % 2) * 29} y={458 + r * 34} width={52} height={28} rx={10} fill="#988A78" stroke={C.ink} strokeWidth={2} />
        )))}
        {/* 老ノッカー・アップ (棒を肩にかつぐ) */}
        <KnockerUp x={330} y={500} s={0.95} f={blink ? 0 : f} pose="walk" old face="smile" />
        {/* セピアの色かぶり・周辺の焼け */}
        <rect x={0} y={0} width={640} height={560} fill={C.sepia} opacity={0.55 * sepia} style={{ mixBlendMode: "color" }} />
        <rect x={0} y={0} width={640} height={560} fill={C.sepiaLight} opacity={0.18 * sepia} />
        <rect x={0} y={0} width={640} height={560} fill="none" stroke={C.sepiaDark} strokeWidth={50} opacity={0.35 * sepia} />
        {/* ひっかき傷 */}
        <path d="M 520 40 l -40 160 M 90 300 l 20 120" stroke="#F3E8D2" strokeWidth={2} opacity={0.6 * sepia} />
      </g>
    </g>
  );
};
const Mz165: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 30));
  const sc = lerp(0.84, 1.02, k);
  const fy = lerp(470, 556, k);
  // 台紙 (写真の左上 = 640,70)
  const PX = 640, PY = 70;
  const lines = [722, 772, 822];
  // 虫めがね: 3行目の上を左から右へ
  const mk = easeInOut(seg(f, 22, 70));
  const mx = lerp(690, 1130, mk), my = lerp(700, lines[2], easeOut(seg(f, 22, 40)));
  const lampFl = 0.9 + 0.1 * Math.sin(f / 3.3) * Math.sin(f / 7.1) - (f > 56 && f < 62 ? 0.25 : 0);
  const doodle = seg(f, 66, 76) * (1 - seg(f, 88, 98));
  const wave = (y: number, x0: number, x1: number, seedI: number) => {
    let d = `M ${x0} ${y}`;
    for (let x = x0; x < x1; x += 24) d += ` q 6 ${-10 - rnd(seedI, x) * 6} 12 0 q 6 ${8 + rnd(seedI + 1, x) * 5} 12 0`;
    return d;
  };
  return (
    <Frame f={f} seed={6165} bg={C.deskWood}>
      <g transform={`translate(960 540) scale(${sc}) translate(-960 ${-fy})`}>
        {/* 机 (木目) */}
        <rect x={-300} y={-300} width={2520} height={1700} fill={C.deskWood} />
        <g stroke={C.deskWoodDark} strokeWidth={5} opacity={0.5}>
          {Array.from({ length: 11 }, (_, i) => (
            <path key={i} d={`M -300 ${-180 + i * 150} q 640 ${rnd(65, i) * 40 - 20} 1260 0 q 640 ${rnd(66, i) * 40 - 20} 1260 0`} fill="none" />
          ))}
        </g>
        {/* スタンドの光だまり */}
        <ellipse cx={520} cy={300} rx={720} ry={560} fill={MP.glow} opacity={0.16 * lampFl} />
        <ellipse cx={600} cy={360} rx={480} ry={380} fill={MP.glow} opacity={0.12 * lampFl} />
        {/* 緑の笠の電気スタンド (左上・真上から) */}
        <g>
          <circle cx={250} cy={120} r={70} fill={MP.brassDark} stroke={C.ink} strokeWidth={6} />
          <rect x={240} y={120} width={20} height={80} fill={MP.brass} stroke={C.ink} strokeWidth={4} />
          <path d="M 120 180 Q 250 140 400 180 L 420 250 Q 260 220 100 250 Z" fill={C.lampGreen} stroke={C.ink} strokeWidth={6} />
          <path d="M 140 196 Q 250 166 380 196" stroke="#7DB896" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M 104 250 Q 260 222 418 250 L 418 262 Q 260 236 104 262 Z" fill={MP.glow} opacity={0.9 * lampFl} stroke={C.ink} strokeWidth={3} />
          <path d="M 260 120 q 30 -60 90 -70" stroke={C.ink} strokeWidth={4} fill="none" />
        </g>
        {/* 資料箱 (右上) と索引カード */}
        <g transform="rotate(4 1600 220)">
          <rect x={1420} y={60} width={380} height={300} rx={6} fill="#C7A77A" stroke={C.ink} strokeWidth={6} />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={1440 + i * 44} y={40 - (i % 3) * 10} width={36} height={60} rx={3} fill={i % 2 ? C.card : "#F3EEDC"} stroke={C.ink} strokeWidth={3} />
          ))}
          <rect x={1560} y={250} width={100} height={46} rx={6} fill={MP.brass} stroke={C.ink} strokeWidth={4} />
          <rect x={1576} y={262} width={68} height={22} fill="#F3EEDC" stroke={C.ink} strokeWidth={2.5} />
        </g>
        {/* 鉛筆とメモ (右下) */}
        <g transform="rotate(-14 1560 640)">
          <rect x={1440} y={520} width={260} height={200} fill="#F3EEDC" stroke={C.ink} strokeWidth={4} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={wave(560 + i * 40, 1460, 1660, 70 + i)} stroke="#8D8370" strokeWidth={3} fill="none" />)}
        </g>
        <g transform="rotate(28 1520 820)">
          <rect x={1400} y={808} width={240} height={22} fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
          <path d="M 1640 808 L 1676 819 L 1640 830 Z" fill={MP.woodLight} stroke={C.ink} strokeWidth={3.5} />
          <rect x={1384} y={808} width={18} height={22} fill={KRP.red} stroke={C.ink} strokeWidth={3.5} />
        </g>
        {/* 台紙 (厚紙)。影 → 本体 → 写真 */}
        <rect x={PX - 50 + 14} y={PY - 40 + 16} width={MZGC_PHOTO.w + 100} height={840} rx={6} fill="#000" opacity={0.25} />
        <rect x={PX - 50} y={PY - 40} width={MZGC_PHOTO.w + 100} height={840} rx={6} fill={C.card} stroke={C.ink} strokeWidth={6} />
        <rect x={PX - 34} y={PY - 24} width={MZGC_PHOTO.w + 68} height={808} rx={4} fill="none" stroke="#CDBE9E" strokeWidth={3} />
        <g transform={`translate(${PX} ${PY})`}>
          <MzGcBoltonPhoto f={f} blink={f >= 76 && f <= 80} />
          <rect x={0} y={0} width={MZGC_PHOTO.w} height={MZGC_PHOTO.h} fill="none" stroke={C.ink} strokeWidth={4} />
          {/* 写真の四隅の留め具 */}
          {([[0, 0, 0], [640, 0, 90], [640, 560, 180], [0, 560, 270]] as const).map(([cx, cy, r], i) => (
            <path key={i} d="M -14 -14 L 40 -14 L -14 40 Z" fill="#3A2E26" stroke={C.ink} strokeWidth={2.5} transform={`translate(${cx} ${cy}) rotate(${r})`} />
          ))}
        </g>
        {/* 手書きの説明書き (読めない波線 3行) */}
        {lines.map((ly, i) => (
          <path key={i} d={wave(ly, PX + 10, PX + (i === 2 ? 560 : 610), 80 + i)} stroke="#4A3A2E" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85} />
        ))}
        {/* 3行目の端の小さな落書き (はっきりは見せない) */}
        <g opacity={0.3} transform={`translate(${PX + 590} ${lines[2] - 6}) scale(0.32)`}>
          <circle r={14} fill="none" stroke="#4A3A2E" strokeWidth={4} />
          <path d="M -14 -16 a 7 7 0 0 1 10 -4 M 14 -16 a 7 7 0 0 0 -10 -4 M -8 14 l -6 8 M 8 14 l 6 8" stroke="#4A3A2E" strokeWidth={4} fill="none" />
        </g>
        {/* 左手 (白い手袋): 台紙の左下の角を押さえる */}
        <g>
          <path d="M 380 1300 Q 470 1060 560 930" stroke={C.ink} strokeWidth={96} fill="none" strokeLinecap="round" />
          <path d="M 380 1300 Q 470 1060 560 930" stroke="#4E5A72" strokeWidth={84} fill="none" strokeLinecap="round" />
          <g transform="translate(590 880) rotate(30)">
            <rect x={-44} y={-30} width={88} height={78} rx={30} fill={C.glove} stroke={C.ink} strokeWidth={5} />
            {[-26, -8, 10, 28].map((fx, i) => <rect key={i} x={fx - 9} y={-70 + Math.abs(i - 1.5) * 6} width={18} height={50} rx={9} fill={C.glove} stroke={C.ink} strokeWidth={4.5} />)}
            <rect x={-70} y={0} width={40} height={20} rx={10} fill={C.glove} stroke={C.ink} strokeWidth={4.5} transform="rotate(-24 -50 10)" />
            <path d="M -30 30 Q 0 40 30 30" stroke="#D8D4CA" strokeWidth={4} fill="none" />
          </g>
        </g>
        {/* 右手 (白い手袋) と虫めがね */}
        <g>
          <path d={`M ${mx + 260} 1400 Q ${mx + 230} ${my + 300} ${mx + 150} ${my + 160}`} stroke={C.ink} strokeWidth={96} fill="none" strokeLinecap="round" />
          <path d={`M ${mx + 260} 1400 Q ${mx + 230} ${my + 300} ${mx + 150} ${my + 160}`} stroke="#4E5A72" strokeWidth={84} fill="none" strokeLinecap="round" />
          {/* 柄 */}
          <rect x={mx + 76} y={my + 56} width={150} height={30} rx={12} fill={MP.woodDark} stroke={C.ink} strokeWidth={5} transform={`rotate(45 ${mx + 76} ${my + 56})`} />
          {/* レンズ (中は拡大して見える) */}
          <circle cx={mx} cy={my} r={104} fill="#EAF2F2" opacity={0.25} />
          {doodle > 0 && (
            <g opacity={doodle} transform={`translate(${PX + 590} ${lines[2] - 10}) scale(${1.6 + Math.sin(f / 2) * 0.12}, ${1.4 - Math.sin(f / 2) * 0.12})`}>
              <circle r={14} fill="none" stroke="#4A3A2E" strokeWidth={4} />
              <circle cx={-10} cy={-16} r={6} fill="none" stroke="#4A3A2E" strokeWidth={4} />
              <circle cx={10} cy={-16} r={6} fill="none" stroke="#4A3A2E" strokeWidth={4} />
              <path d="M 0 0 l 0 -8 M 0 0 l 6 3 M -8 14 l -6 8 M 8 14 l 6 8" stroke="#4A3A2E" strokeWidth={4} fill="none" />
            </g>
          )}
          <circle cx={mx} cy={my} r={104} fill="none" stroke={MP.brassDark} strokeWidth={16} />
          <circle cx={mx} cy={my} r={104} fill="none" stroke={C.ink} strokeWidth={4} />
          <circle cx={mx} cy={my} r={112} fill="none" stroke={C.ink} strokeWidth={4} />
          <path d={`M ${mx - 64} ${my - 50} Q ${mx - 40} ${my - 80} ${mx - 4} ${my - 84}`} stroke={KRP.white} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.7} />
          {/* 手 (柄を握る) */}
          <g transform={`translate(${mx + 150} ${my + 140}) rotate(45)`}>
            <rect x={-44} y={-34} width={90} height={74} rx={28} fill={C.glove} stroke={C.ink} strokeWidth={5} />
            {[-26, -6, 14].map((fx) => <rect key={fx} x={fx - 9} y={-52} width={20} height={36} rx={10} fill={C.glove} stroke={C.ink} strokeWidth={4.5} />)}
            <rect x={-62} y={-6} width={36} height={20} rx={10} fill={C.glove} stroke={C.ink} strokeWidth={4.5} />
          </g>
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #166 本人は、目覚まし時計で、起きていた。
// 格: 山 / seed 6166
// 絵: どこ: #165 の写真の中へ飛び込み、セピアが夜の紺 (MP.night) に変わる。老人自身の2階の寝室。つぎはぎの布団・壁に山高帽とコートと赤いマフラー・ベッド脇に長い棒・窓の外は真っ暗な石畳とガス灯。枕元の木の台に BellClock (短辺の1/2近く。2つのベル・ハンマー・2本の脚・ゼンマイのつまみ・文字盤の数字。針は3時45分)。演出: 老人は KnockerUp (pose="sleep", old=true) でナイトキャップ姿、大いびき。BellClock (ring=1) がジリリリと鳴り、音の線でベッドが揺れる。老人が KnockerUp (pose="jump", old=true, face="surprised") で布団ごと真上に跳ね上がり、ナイトキャップが宙でくるくる、口ひげが逆立つ。札は出さない (事件だけで笑わせる)。動き: f0-20 写真の枠を抜けて部屋へ / f45 鳴る / f50-75 跳ね上がる / f75-100 空中で一瞬止まる (間) / f100-125 ベッドにどすん / f125-150 振動で壁の山高帽が落ちて頭にすぽっ
// どこ: #165 の写真の中へ飛び込み、セピアが夜の紺に変わる。老人自身の2階の寝室 (#164 と同じ部屋)。枕元の台に大きな BellClock (3時45分)
// 演出: ナイトキャップの老人が大いびき。BellClock がジリリリと鳴り、部屋じゅうが揺れる。老人は布団ごと真上に跳ね上がり (ばんざい・驚き顔・
//       ナイトキャップは宙へ・口ひげが逆立つ)、空中で一瞬止まって、ベッドにどすん。振動で頭板に掛けた山高帽が落ちて、頭にすぽっ。札は出さない
// 動き: f0-16 写真の中へ (セピア→夜) / f14-22 大いびき / f22 鳴る / f26-38 跳ね上がる / f38-54 空中で止まる (間) / f54-62 どすん / f66-80 山高帽がすぽっ
// 老人の顔の重ね (Person と同じ transform。白い横髪・白い眉・白い口ひげ)。bristle で口ひげが逆立つ
const MzGcOldFace: React.FC<{ x: number; y: number; s?: number; f: number; lean?: number; bristle?: number }> = ({ x, y, s = 1, f, lean = 0, bristle = 0 }) => {
  const bob = Math.sin(f / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      <path d="M -64 -250 Q -78 -226 -62 -198 Q -56 -222 -54 -244 Z" fill="#F1F1EE" stroke={C.ink} strokeWidth={3.5} />
      <path d="M 64 -250 Q 78 -226 62 -198 Q 56 -222 54 -244 Z" fill="#F1F1EE" stroke={C.ink} strokeWidth={3.5} />
      <g stroke="#F4F4F0" strokeWidth={7} strokeLinecap="round">
        <line x1={-36} y1={-252 - bristle * 8} x2={-12} y2={-250} />
        <line x1={12} y1={-250} x2={36} y2={-252 - bristle * 8} />
      </g>
      <path d="M -32 -194 Q -16 -210 0 -199 Q 16 -210 32 -194 Q 18 -184 0 -193 Q -18 -184 -32 -194 Z" fill="#F4F4F0" stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
      {bristle > 0 && [-1, 1].map((sd) => [0, 1, 2].map((i) => (
        <line key={`${sd}${i}`} x1={sd * (14 + i * 8)} y1={-200} x2={sd * (20 + i * 12)} y2={-224 - i * 4 - bristle * 6}
          stroke="#F4F4F0" strokeWidth={5} strokeLinecap="round" />
      )))}
    </g>
  );
};
const Mz166: React.FC<{ f: number }> = ({ f }) => {
  const [bx, by] = OLD_BED;
  const [nx, ny] = OLD_NIGHT;
  const ring = f >= 22 ? 1 : 0;
  const shake = ring && f < 64 ? Math.sin(f * 2.3) * 5 : 0;
  // カメラ (ベッドの頭と目覚ましに寄る)
  const sc = 1.32, fx = 900 + shake, fy = 500 + Math.cos(f * 2.9) * (shake ? 3 : 0);
  // 跳ね上がり: 足元の高さ (KnockerUp jump の自前の上下ゆれを打ち消して使う)
  const upK = easeOut(seg(f, 26, 38));
  const downK = seg(f, 54, 62);
  const jumping = f >= 26 && f < 62;
  const feetY = jumping ? (f < 54 ? lerp(700, 470, upK) - Math.sin(seg(f, 38, 54) * Math.PI) * 10 : lerp(470, 700, downK * downK)) : 700;
  const JX = 1040, JS = 1;
  const partBounce = Math.abs(Math.sin(f / 5)) * 46 * JS + 20 * JS;
  const landed = f >= 62;
  const hatK = easeInOut(seg(f, 66, 80));
  const hatPos: [number, number] = [lerp(921, JX, hatK), lerp(470, 708 - 268 + 4, hatK) - Math.sin(hatK * Math.PI) * 120];
  const photo = 1 - seg(f, 4, 18);
  const sepia = 1 - seg(f, 6, 20);
  return (
    <Frame f={f} seed={6166} bg={MP.nightDeep}>
      <g style={{ isolation: "isolate" }}>
        <g transform={cam(sc, fx, fy)}>
          <MzGcOldRoom f={f} min={225} hatOn={false} tassels dim={0.34} />
          {/* 頭板に掛けた山高帽 (落ちて頭にすぽっ) */}
          {!landed || hatK < 1 ? (
            <MzGcBowler x={hatPos[0]} y={hatPos[1]} s={0.8} rot={landed ? hatK * 380 : Math.sin(f * 2.1) * (ring ? 8 : 0)} />
          ) : null}
          {/* ベッド */}
          {f < 26 ? (
            <MzGcBed id="mzgc166q" x={bx} y={by} s={1} f={f} old />
          ) : (
            <MzGcBed id="mzgc166q2" x={bx} y={by + (f >= 62 && f < 70 ? Math.sin((f - 62) * 2) * 8 : 0)} s={1} f={f} who="none" quilt={landed} quiltLift={-20} />
          )}
          {/* 大いびき */}
          {f < 26 && (
            <text x={bx - 330} y={by - 150 + Math.sin(f / 3) * 4} fontFamily={FONT} fontWeight={900} fontSize={64} fill={KRP.white} stroke={C.ink} strokeWidth={3.5}
              paintOrder="stroke" transform={`rotate(-12 ${bx - 330} ${by - 150})`}>グオー</text>
          )}
          {/* 跳ね上がる老人 (布団ごと) */}
          {jumping && (
            <g>
              <g transform={`translate(${JX} ${feetY + 30}) rotate(${Math.sin(f / 2) * 8}) translate(${-JX} ${-(feetY + 30)})`}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <path key={i} d={`M ${JX - 180 + i * 60} ${feetY + 22 - Math.sin((i / 6) * Math.PI) * 30} L ${JX - 120 + i * 60} ${feetY + 22 - Math.sin(((i + 1) / 6) * Math.PI) * 30} L ${JX - 120 + i * 60} ${feetY + 92 - Math.sin(((i + 1) / 6) * Math.PI) * 30 + (i % 2) * 10} L ${JX - 180 + i * 60} ${feetY + 92 - Math.sin((i / 6) * Math.PI) * 30 + ((i + 1) % 2) * 10} Z`}
                    fill={[C.quilt1, C.quilt2, C.quilt3, C.quilt4][i % 4]} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
                ))}
              </g>
              <KnockerUp x={JX} y={feetY + partBounce} s={JS} f={f} pose="jump" old face="surprised" />
              {/* 逆立つ口ひげ */}
              <g transform={`translate(${JX + 27} ${feetY - 193 + Math.sin(f / 13) * 3}) rotate(8)`}>
                {[-1, 1].map((sd) => [0, 1, 2].map((i) => (
                  <line key={`${sd}${i}`} x1={sd * (12 + i * 9)} y1={-2} x2={sd * (22 + i * 14)} y2={-22 - i * 5} stroke="#F4F4F0" strokeWidth={5} strokeLinecap="round" />
                )))}
              </g>
            </g>
          )}
          {/* どすん後: ベッドに座りこむ (寝間着・驚き顔のまま) */}
          {landed && (
            <g>
              <Person x={JX} y={708} s={JS} f={f} face="surprised" pose="banzai" cloth="#E9E3D4" clothDark="#C9C1AE" hair="none" />
              <MzGcOldFace x={JX} y={708} s={JS} f={f} bristle={1 - seg(f, 84, 100)} />
              {/* 布団 (腰から下) */}
              <path d={`M ${JX - 190} 660 Q ${JX} 620 ${JX + 220} 650 L ${bx + 66} 744 L ${JX - 190} 744 Z`} fill={C.quilt1} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
              <path d={`M ${JX - 120} 650 L ${JX - 120} 744 M ${JX} 634 L ${JX} 744 M ${JX + 120} 644 L ${JX + 120} 744`} stroke={C.ink} strokeWidth={4} strokeDasharray="8 6" />
              {hatK >= 1 && <MzGcBowler x={JX} y={708 - 268 + 4 + Math.sin(f / 13) * 3} s={1} />}
              {hatK >= 1 && f < 92 && <text x={JX + 90} y={400} fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.white} stroke={C.ink} strokeWidth={3} paintOrder="stroke">すぽっ</text>}
              {/* どすんのほこり */}
              {f < 76 && [0, 1, 2, 3].map((i) => (
                <circle key={i} cx={JX - 180 + i * 120} cy={760} r={20 + seg(f, 62, 76) * 30} fill={KRP.white} opacity={(1 - seg(f, 62, 76)) * 0.6} />
              ))}
              {f < 74 && <text x={JX - 300} y={820} fontFamily={FONT} fontWeight={900} fontSize={60} fill={KRP.white} stroke={C.ink} strokeWidth={4} paintOrder="stroke">ドスン</text>}
            </g>
          )}
          {/* 枕元の大きなベル式目覚まし (3時45分) */}
          <BellClock x={nx} y={ny - 150 * 0.74} s={0.74} f={f} ring={ring} time={225} alarm={225} />
          {ring > 0 && (
            <text x={nx - 150} y={ny - 330 + Math.sin(f) * 4} fontFamily={FONT} fontWeight={900} fontSize={62} fill={MP.bell} stroke={C.ink} strokeWidth={4} paintOrder="stroke"
              transform={`rotate(-8 ${nx - 150} ${ny - 330})`}>ジリリリ</text>
          )}
        </g>
        {/* 写真から入る (セピアがほどける) */}
        <rect x={0} y={0} width={1920} height={1080} fill={C.sepia} opacity={0.6 * sepia} style={{ mixBlendMode: "color" }} />
        {photo > 0 && (
          <g opacity={photo} transform={`translate(960 540) scale(${lerp(2.2, 5, easeOut(seg(f, 0, 18)))}) translate(-320 -280)`}>
            <MzGcBoltonPhoto f={f} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #167 人間目覚まし時計を起こしていたのは、目覚まし時計でした。
// 格: 山 / seed 6167
// 絵: どこ: #166 の寝室の続き (BellClock はまだ ring=1)。壁を外して、隣の家々 (MachiNami の2階の窓) まで横につながる町の断面の長い1枚。演出: 前半、ベッドに座った老人 (KnockerUp pose="walk", old=true, face="worried") が鳴り続ける時計を両手でつかみ (腕は2本 pose で描く)、下からあおった大きな時計とぐぬぬとにらみ合う。指でハンマーを止める。後半、カメラが右へパンし、コートの老人が棒 (pose="knock") で隣の窓をコンコン → 工場の男性 (ハンチング帽・短い黒髪) が飛び起き → 隣の部屋の女性 (長い茶髪を後ろで結ぶ・えんじの寝間着) を揺り起こす。時計 → 老人 → 男性 → 女性へ、起こす順に太い矢印が1本ずつ伸び、根元の BellClock がきらりとどや顔のように光る。動き: f0-40 にらみ合い (下から寄る) / f40-55 ハンマーを止める / f55-110 右へパン・ノック・男性と女性が起きる / f110-150 矢印が左から伸びて時計がきらり
// どこ: #166 の寝室の続き。表の壁を外した長屋の断面 (2階の部屋が横に3つ並ぶ・1階の表と通り)。
//       左=老人の部屋 / 中=工場の男性の部屋 / 右=女性の部屋
// 演出: 前半、ベッドの老人が鳴り続ける目覚ましを両手でつかみ、大写しでぐぬぬとにらみ合って、指でハンマーを止める。
//       カメラが右へパンすると、コート姿の老人が通りから棒で隣の2階の窓をコンコン → ハンチング帽の男性が飛び起き →
//       隣の部屋の女性 (茶色の髪を後ろで結ぶ・えんじの寝間着) を揺り起こす。時計→老人→男性→女性へ太い矢印が1本ずつ伸び、
//       最後に引くと、根元の目覚まし時計がきらりと光る
// 動き: f0-14 にらみ合い (下から寄る) / f14-24 ハンマーを止める / f24-60 右へパン・矢印① / f36 コンコン・男性が飛び起き・矢印② /
//       f50-66 男性が女性を揺り起こす・矢印③ / f96-124 引いて全体・時計がきらり
const MzGcArrow: React.FC<{ a: [number, number]; c: [number, number]; b: [number, number]; t: number; color?: string }> = ({ a, c, b, t, color = KRP.orange }) => {
  if (t <= 0) return null;
  const n = 24, pts: string[] = [];
  const P = (u: number): [number, number] => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];
  const tt = Math.min(t, 1);
  for (let i = 0; i <= n; i++) { const p = P((i / n) * tt * 0.92); pts.push(`${p[0]},${p[1]}`); }
  const e = P(tt * 0.92), e2 = P(Math.max(tt * 0.92 - 0.04, 0)), ang = Math.atan2(e[1] - e2[1], e[0] - e2[0]) * 180 / Math.PI;
  return (
    <g>
      <polyline points={pts.join(" ")} fill="none" stroke={C.ink} strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" />
      <g transform={`translate(${e[0]} ${e[1]}) rotate(${ang})`}>
        <path d="M -6 -40 L 52 0 L -6 40 Z" fill={color} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      </g>
    </g>
  );
};
// 寝ている人 (横から・頭が左)。Person を -90 度回して、閉じた目と髪を重ねる
const MzGcLying: React.FC<{ x: number; y: number; s: number; f: number; woman?: boolean; wob?: number }> = ({ x, y, s, f, woman = false, wob = 0 }) => (
  <g transform={`rotate(${-90 + wob} ${x} ${y})`}>
    {woman && <path d={`M ${x + 40 * s} ${y - 270 * s} Q ${x + 110 * s} ${y - 250 * s} ${x + 96 * s} ${y - 170 * s} Q ${x + 70 * s} ${y - 200 * s} ${x + 50 * s} ${y - 236 * s} Z`} fill={C.hairBrown} stroke={C.ink} strokeWidth={4 * s} />}
    <Person x={x} y={y} s={s} f={f} face="normal" pose="stand" still cloth={woman ? C.maroon : "#7E93B4"} clothDark={woman ? C.maroonDark : "#5A6E90"} hair={woman ? "none" : "cap"} />
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {woman && (
        <g>
          <path d="M -62 -236 Q -66 -296 0 -296 Q 66 -296 62 -236 Q 34 -266 0 -264 Q -34 -266 -62 -236 Z" fill={C.hairBrown} stroke={C.ink} strokeWidth={4} />
          <path d="M -62 -240 Q -74 -200 -66 -160 L -52 -168 Q -58 -204 -52 -236 Z" fill={C.hairBrown} stroke={C.ink} strokeWidth={4} />
          <path d="M 62 -240 Q 74 -200 66 -160 L 52 -168 Q 58 -204 52 -236 Z" fill={C.hairBrown} stroke={C.ink} strokeWidth={4} />
        </g>
      )}
      <ellipse cx={-24} cy={-222} rx={16} ry={21} fill={KRP.white} />
      <ellipse cx={24} cy={-222} rx={16} ry={21} fill={KRP.white} />
      <path d="M -36 -220 Q -24 -210 -12 -220 M 12 -220 Q 24 -210 36 -220" stroke={C.ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />
    </g>
  </g>
);
// 女性の髪 (起きている姿用。Person と同じ座標)
const MzGcWomanHair: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => {
  const bob = Math.sin(f / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <path d="M -62 -236 Q -66 -296 0 -296 Q 66 -296 62 -236 Q 34 -266 0 -264 Q -34 -266 -62 -236 Z" fill={C.hairBrown} stroke={C.ink} strokeWidth={4} />
      <path d="M -62 -240 Q -74 -200 -66 -160 L -52 -168 Q -58 -204 -52 -236 Z" fill={C.hairBrown} stroke={C.ink} strokeWidth={4} />
      <path d="M 62 -240 Q 74 -200 66 -160 L 52 -168 Q 58 -204 52 -236 Z" fill={C.hairBrown} stroke={C.ink} strokeWidth={4} />
      <path d={`M 50 -280 Q 100 ${-290 + Math.sin(f / 6) * 4} 104 -220 Q 84 -240 60 -262 Z`} fill={C.hairBrown} stroke={C.ink} strokeWidth={4} />
      <circle cx={56} cy={-274} r={9} fill={KRP.red} stroke={C.ink} strokeWidth={3} />
    </g>
  );
};
// ハンチング帽 (Person の頭に。Person と同じ座標)
const MzGcHunting: React.FC<{ x: number; y: number; s: number; f: number; lift?: number }> = ({ x, y, s, f, lift = 0 }) => (
  <g transform={`translate(${x} ${y + Math.sin(f / 13) * 3 - lift}) scale(${s})`}>
    <path d="M -64 -258 Q -60 -306 4 -306 Q 62 -304 64 -262 Z" fill={C.hunting} stroke={C.ink} strokeWidth={4.5} />
    <path d="M 30 -262 Q 80 -270 96 -252 Q 70 -246 30 -250 Z" fill={C.hunting} stroke={C.ink} strokeWidth={4} />
    <path d="M -40 -290 Q 0 -298 40 -290" stroke="#7A766A" strokeWidth={4} fill="none" />
  </g>
);
const Mz167: React.FC<{ f: number }> = ({ f }) => {
  const kPan = easeInOut(seg(f, 24, 60));
  const kOut = easeInOut(seg(f, 96, 124));
  const sc = kOut > 0 ? logLerp(1.0, 0.6, kOut) : logLerp(1.9, 1.0, kPan);
  const fx = kOut > 0 ? lerp(1720, 1250, kOut) : lerp(520, 1720, kPan);
  const fy = kOut > 0 ? lerp(560, 540, kOut) : lerp(450, 560, kPan);
  const ring = f < 18 ? 1 : 0;
  const grip = Math.sin(f / 1.6) * (ring ? 3 : 0);
  // 部屋の配置
  const ROOMS = [[-320, 900, "#A7A99E", "#9A9C90"], [900, 1800, "#C9B48E", "#BBA47C"], [1800, 2900, "#D8B6B0", "#C9A29C"]] as const;
  const manUp = f >= 38;
  const womanUp = f >= 64;
  const shakeW = f >= 50 && f < 64 ? Math.sin(f * 1.4) * 6 : 0;
  const glint = seg(f, 104, 112);
  return (
    <Frame f={f} seed={6167} bg={MP.nightDeep} dark>
      <g transform={cam(sc, fx, fy)}>
        {/* 夜明け前の空と屋根 */}
        <rect x={-700} y={-700} width={4200} height={780} fill="#2B3256" />
        {[[-200, -300], [300, -200], [900, -400], [1500, -260], [2100, -380], [2700, -220], [3100, -320]].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={4} fill="#FFF6D8" opacity={0.5 + 0.4 * Math.sin(f / 9 + i)} />
        ))}
        <path d="M -700 130 L -700 60 L 3500 60 L 3500 130 Z" fill="#454C5E" stroke={C.ink} strokeWidth={6} />
        {[-100, 420, 1350, 2250, 3000].map((cx) => (
          <g key={cx}>
            <rect x={cx - 40} y={-10} width={80} height={70} fill={MP.brick} stroke={C.ink} strokeWidth={5} />
            <rect x={cx - 48} y={-20} width={96} height={14} fill={MP.stoneLight} stroke={C.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 2階の部屋 (表の壁を外した断面) */}
        {ROOMS.map(([x0, x1, wall, stripe], i) => (
          <g key={i}>
            <rect x={x0} y={130} width={x1 - x0} height={470} fill={wall} />
            <g fill={stripe}>{Array.from({ length: Math.ceil((x1 - x0) / 70) }, (_, j) => <rect key={j} x={x0 + j * 70} y={130} width={20} height={470} />)}</g>
            <rect x={x0} y={520} width={x1 - x0} height={80} fill={MP.woodDark} />
            <rect x={x0} y={514} width={x1 - x0} height={10} fill={MP.wood} />
          </g>
        ))}
        {/* 部屋の境の壁 (れんがの断面)。中と右の間には戸口 */}
        {[900, 1800].map((wx) => (
          <g key={wx}>
            <rect x={wx - 22} y={130} width={44} height={470} fill={MP.brickDark} stroke={C.ink} strokeWidth={5} />
            {wx === 1800 && <rect x={wx - 22} y={330} width={44} height={270} fill="#3A3030" stroke={C.ink} strokeWidth={4} />}
          </g>
        ))}
        {/* 部屋の小物: 老人の部屋の帽子掛け / 男性の部屋の作業着 / 女性の部屋の鏡と花 */}
        <rect x={250} y={230} width={160} height={16} rx={4} fill={MP.wood} stroke={C.ink} strokeWidth={4} />
        <path d="M 1640 210 L 1700 210 L 1720 420 L 1620 420 Z" fill="#5A6070" stroke={C.ink} strokeWidth={5} />
        <circle cx={1670} cy={200} r={8} fill={MP.brass} stroke={C.ink} strokeWidth={3} />
        <ellipse cx={2600} cy={290} rx={60} ry={80} fill="#CFE3EC" stroke={MP.brass} strokeWidth={10} />
        <path d="M 2580 250 L 2610 230" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" />
        {/* 床の断面 */}
        <rect x={-700} y={600} width={4200} height={44} fill={MP.wood} stroke={C.ink} strokeWidth={6} />
        <g stroke={MP.woodDark} strokeWidth={4}>{Array.from({ length: 40 }, (_, i) => <line key={i} x1={-700 + i * 110} y1={604} x2={-700 + i * 110} y2={640} />)}</g>
        {/* 1階の表 (れんが・扉・窓) と歩道・石畳 */}
        <rect x={-700} y={644} width={4200} height={220} fill={MP.brick} stroke={C.ink} strokeWidth={5} />
        <g stroke={MP.mortar} strokeWidth={2.5} opacity={0.55}>
          {Array.from({ length: 8 }, (_, r) => <line key={r} x1={-700} y1={670 + r * 26} x2={3500} y2={670 + r * 26} />)}
        </g>
        {[-200, 700, 1600, 2500].map((dx, i) => (
          <g key={dx}>
            <rect x={dx} y={680} width={90} height={184} fill={["#3E5C46", "#2E3F5C", "#5A2E2E", "#2E5452"][i]} stroke={C.ink} strokeWidth={5} />
            <circle cx={dx + 72} cy={780} r={6} fill={MP.brass} />
            <rect x={dx + 220} y={690} width={130} height={120} fill="#262B40" stroke={C.ink} strokeWidth={5} />
            <path d={`M ${dx + 285} 690 L ${dx + 285} 810 M ${dx + 220} 750 L ${dx + 350} 750`} stroke="#F1EADF" strokeWidth={5} />
          </g>
        ))}
        <rect x={-700} y={864} width={4200} height={56} fill="#9C958C" stroke={C.ink} strokeWidth={4} />
        <rect x={-700} y={920} width={4200} height={700} fill="#6E655E" />
        {Array.from({ length: 6 }, (_, r) => Array.from({ length: 62 }, (_, c) => (
          <rect key={`${r}-${c}`} x={-700 + c * 70 + (r % 2) * 35} y={928 + r * 44} width={62} height={36} rx={13}
            fill={(r * 3 + c) % 4 ? "#857B73" : "#91877E"} stroke={C.ink} strokeWidth={2.5} />
        )))}
        {/* ===== 左: 老人の部屋 ===== */}
        <MzGcBed id="mzgc167a" x={760} y={448} s={0.8} f={f} who="none" quiltLift={-30} />
        <rect x={150} y={470} width={140} height={20} rx={4} fill={MP.woodLight} stroke={C.ink} strokeWidth={5} />
        <rect x={160} y={488} width={120} height={112} fill={MP.wood} stroke={C.ink} strokeWidth={5} />
        {f < 26 ? (
          <g>
            {/* ベッドに座って目覚ましをつかむ老人 (寝間着・山高帽) */}
            <Person x={520} y={536} s={0.8} f={f} face="worried" pose="hold" cloth="#E9E3D4" clothDark="#C9C1AE" hair="none" gaze={[0, 4]} />
            <MzGcOldFace x={520} y={536} s={0.8} f={f} bristle={0.6} />
            <MzGcBowler x={520} y={536 - 268 * 0.8 + 4 + Math.sin(f / 13) * 3} s={0.8} />
            <path d="M 360 520 Q 520 480 700 512 L 700 560 L 360 560 Z" fill={C.quilt1} stroke={C.ink} strokeWidth={5} />
            {/* ぐぬぬ (怒りの印と汗) */}
            <path d="M 600 300 l 14 -14 l 4 18 l 14 -10" stroke={KRP.red} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 446 320 q -8 14 0 22 q 8 -8 0 -22 Z" fill="#9FD2F0" stroke={C.ink} strokeWidth={3} />
            {/* 両手でつかんだ目覚まし (まだ鳴っている → 指で止める) */}
            <BellClock x={520 + grip} y={506} s={0.36} f={f} ring={ring} time={225} alarm={225} />
            {/* ハンマーを押さえる指 */}
            {f >= 12 && (
              <g transform={`translate(${520} ${506 - 184 * 0.36 + lerp(-40, 0, easeOut(seg(f, 12, 18)))})`}>
                <rect x={-9} y={-34} width={18} height={40} rx={9} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
              </g>
            )}
            {f >= 18 && f < 26 && <text x={600} y={330} fontFamily={FONT} fontWeight={900} fontSize={36} fill={KRP.white} stroke={C.ink} strokeWidth={3} paintOrder="stroke">ピタッ</text>}
          </g>
        ) : (
          <BellClock x={220} y={470 - 150 * 0.44} s={0.44} f={f} ring={0} time={226} alarm={225} />
        )}
        {/* ===== 中: 工場の男性の部屋 ===== */}
        <MzGcBed id="mzgc167b" x={1580} y={448} s={0.8} f={f} who="none" quilt={!manUp} quiltLift={0}
          slot={!manUp ? <MzGcLying x={1580} y={448} s={0.8} f={f} /> : undefined} />
        {manUp && f < 50 && (
          <g>
            <Person x={1220} y={600} s={0.8} f={f} face={f < 50 ? "surprised" : "normal"} pose={f < 50 ? "banzai" : "point"} cloth="#7E93B4" clothDark="#5A6E90" hair="cap" />
            <MzGcHunting x={1220} y={600} s={0.8} f={f} lift={f < 46 ? 30 : 0} />
          </g>
        )}
        {/* 表の窓 (中の部屋)。老人がここをコンコン */}
        <g>
          <rect x={1080} y={300} width={160} height={210} fill="#C9D6F2" opacity={0.16} />
          <rect x={1080} y={300} width={160} height={210} fill="none" stroke="#F1EADF" strokeWidth={10} />
          <path d="M 1160 300 L 1160 510 M 1080 405 L 1240 405" stroke="#F1EADF" strokeWidth={6} />
          <rect x={1080} y={300} width={160} height={210} fill="none" stroke={C.ink} strokeWidth={4} />
          <rect x={1066} y={510} width={188} height={14} fill={MP.stoneLight} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* ===== 右: 女性の部屋 ===== */}
        <MzGcBed id="mzgc167c" x={2480} y={448} s={0.8} f={f} who="none" quilt={!womanUp}
          slot={!womanUp ? <MzGcLying x={2480} y={448} s={0.8} f={f} woman wob={shakeW * 0.5} /> : undefined} />
        {womanUp && (
          <g>
            <Person x={2300} y={536} s={0.8} f={f} face={f < 80 ? "surprised" : "normal"} pose="stand" cloth={C.maroon} clothDark={C.maroonDark} hair="none" />
            <MzGcWomanHair x={2300} y={536} s={0.8} f={f} />
            <path d="M 2180 520 Q 2400 490 2560 520 L 2560 560 L 2180 560 Z" fill={C.quilt2} stroke={C.ink} strokeWidth={5} />
          </g>
        )}
        {/* 男性が女性を揺り起こす (男性は戸口から入る) */}
        {f >= 50 && (
          <g>
            <Person x={2020} y={600} s={0.8} f={f} face="normal" pose="point" cloth="#7E93B4" clothDark="#5A6E90" hair="cap" />
            <MzGcHunting x={2020} y={600} s={0.8} f={f} />
            {f < 64 && <text x={2120} y={300} fontFamily={FONT} fontWeight={900} fontSize={36} fill={KRP.white} stroke={C.ink} strokeWidth={3} paintOrder="stroke">ゆさゆさ</text>}
          </g>
        )}
        {/* ===== 通り: コート姿の老人がコンコン ===== */}
        {f >= 26 && <KnockerUp x={980} y={900} s={0.85} f={f} pose="knock" old face="smile" tip={[1120, 440]} />}
        {f >= 34 && f < 50 && <text x={1170} y={290} fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.white} stroke={C.ink} strokeWidth={3} paintOrder="stroke" opacity={0.6 + 0.4 * Math.sin(f / 2)}>コンコン</text>}
        {/* 起こす順の矢印: 時計 → 老人 → 男性 → 女性 */}
        <MzGcArrow a={[300, 380]} c={[640, 760]} b={[900, 640]} t={seg(f, 28, 38)} color={MP.bell} />
        <MzGcArrow a={[1050, 640]} c={[1100, 520]} b={[1190, 470]} t={seg(f, 38, 48)} color={KRP.orange} />
        <MzGcArrow a={[1300, 340]} c={[1700, 200]} b={[2080, 330]} t={seg(f, 52, 64)} color={KRP.yellow} />
        {/* きらり (根元の目覚まし) */}
        {glint > 0 && (
          <g>
            <circle cx={220} cy={404} r={150 * glint} fill={MP.glow} opacity={0.35 * glint} />
            <g transform={`translate(260 330) scale(${pop(glint) * (1 + 0.15 * Math.sin(f / 2))}) rotate(${f * 3})`}>
              <path d="M 0 -60 L 14 -14 L 60 0 L 14 14 L 0 60 L -14 14 L -60 0 L -14 -14 Z" fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
            </g>
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #168 起こす人を起こすのは、やっぱり、他人です。それがたまたま、機械だっただけです。
// 格: 山 / seed 6168
// 絵: どこ: 夜明け前のボルトンの町 (MachiNami, sky=紺→ほんのり MP.dawn、windows=左から順に lit)。石畳・ガス灯・遠くの煙突。演出: 町の上に NazoBell (s 大きめ、solved=false) が浮かび、謎の4か所 (鶏人・合図係・番人時計・ノッカー・アップ) の小さな影絵 がそのまわりを順にくるっと回る。f60 で「?」がぽろっと外れて「!」になる (solved=true)。落ちた「?」は石畳を転がり、老人の家の窓辺の BellClock (ring=0) にこつんと当たって止まる。窓辺では老人 (KnockerUp old=true, pose="walk", face="smile") が帽子をかぶり、時計の頭をぽんとなでて出かける (腕は2本 pose で描く)。並ぶ窓に次々と明かりがつく。動き: f0-30 上空から NazoBell へ寄る / f30-60 影絵が回る / f60-80 「?」→「!」がきらり / f80-120 「?」が転がって時計に当たる・なでる / f120-170 窓に明かり・カメラが少し引く
// どこ: 夜明け前のボルトンの町 (MachiNami。空が紺からほんのり夜明けの橙へ・窓に左から順に明かり)
// 演出: 町の上に大きな NazoBell。そのまわりを、これまでの謎の4か所 (鶏人・修道院の合図係・番人の時計・ノッカー・アップ) の
//       影絵の丸札が順にくるっと回る。「?」がぽろっと外れて「!」に (solved)。落ちた「?」は石畳で弾んで転がり、
//       老人の家の玄関先の BellClock にこつんと当たって止まる。老人は時計の頭をぽんとなでて、棒をかついで出かけていく。
//       並ぶ窓に次々と明かりがつき、カメラが少し引く
// 動き: f0-20 上空から NazoBell へ寄る / f4-30 影絵が回る / f30-36 「?」→「!」 / f34-62 「?」が落ちて転がり時計にこつん / f66-84 なでる /
//       f96-150 出かける / f70-160 窓に明かり / f120-170 カメラが引く
const MzGcSilBadge: React.FC<{ x: number; y: number; kind: number; t: number }> = ({ x, y, kind, t }) => {
  const k = pop(clamp01(t));
  if (k <= 0) return null;
  const SIL = "#2A2A3A";
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <circle r={62} fill="#FBF3E2" stroke={C.ink} strokeWidth={5} />
      <circle r={54} fill="none" stroke={MP.brassDark} strokeWidth={3} strokeDasharray="6 5" />
      {kind === 0 && (
        /* 鶏人 (とさかの冠の横顔) */
        <g>
          <path d="M -20 44 Q -34 10 -16 -8 Q 0 -20 18 -10 Q 30 0 26 14 L 34 20 L 24 24 Q 22 40 8 44 Z" fill={SIL} />
          <path d="M -18 -8 Q -20 -30 -6 -26 Q -2 -40 8 -30 Q 16 -42 22 -24 Q 30 -24 22 -8 Z" fill={KRP.red} stroke={C.ink} strokeWidth={2.5} />
        </g>
      )}
      {kind === 1 && (
        /* 修道院の合図係 (頭巾の人と手鈴) */
        <g>
          <path d="M -30 46 Q -32 0 -14 -14 Q -16 -40 4 -40 Q 24 -40 22 -14 Q 34 0 32 46 Z" fill={SIL} />
          <path d="M 26 -6 Q 26 -24 38 -24 Q 50 -24 50 -6 L 54 -2 L 22 -2 Z" fill={MP.brass} stroke={C.ink} strokeWidth={2.5} />
        </g>
      )}
      {kind === 2 && (
        /* 番人の鉄の時計 (上にベル) */
        <g>
          <rect x={-26} y={-12} width={52} height={54} rx={6} fill={SIL} />
          <circle cx={0} cy={14} r={16} fill="#FBF3E2" />
          <path d="M 0 14 L 0 4 M 0 14 L 8 18" stroke={SIL} strokeWidth={3} />
          <path d="M -16 -12 Q -16 -36 0 -36 Q 16 -36 16 -12 Z" fill={MP.brass} stroke={C.ink} strokeWidth={2.5} />
        </g>
      )}
      {kind === 3 && (
        /* ノッカー・アップ (山高帽と長い棒) */
        <g>
          <line x1={14} y1={40} x2={40} y2={-46} stroke={SIL} strokeWidth={6} strokeLinecap="round" />
          <path d="M -26 46 Q -28 8 -14 0 Q -22 -10 -18 -22 L -30 -22 L -30 -26 L 20 -26 L 20 -22 L 10 -22 Q 14 -10 6 0 Q 20 8 18 46 Z" fill={SIL} />
          <path d="M -22 -26 Q -22 -46 -5 -46 Q 12 -46 12 -26 Z" fill={SIL} />
          <rect x={-18} y={-8} width={30} height={7} fill={KRP.red} />
        </g>
      )}
    </g>
  );
};
const Mz168: React.FC<{ f: number }> = ({ f }) => {
  const NB: [number, number] = [960, 330];
  const NS = 2.0;
  const k0 = easeInOut(seg(f, 0, 20));
  const k1 = easeInOut(seg(f, 30, 52));
  const k2 = easeInOut(seg(f, 120, 170));
  const sc = k2 > 0 ? lerp(1.2, 1.0, k2) : lerp(1.0, 1.2, k0);
  const fx = k2 > 0 ? lerp(900, 960, k2) : lerp(960, 900, k1);
  const fy = k2 > 0 ? lerp(560, 540, k2) : lerp(540, 450, k0) + (560 - 450) * k1;
  const sky = lerp(0.2, 0.95, seg(f, 0, 175));
  const solved = f >= 34;
  // 落ちる「?」(NazoBell の右上の札の位置から)
  const q0: [number, number] = [NB[0] + 44 * NS, NB[1] - 44 * NS];
  const CL: [number, number] = [740, 856];
  const fall = seg(f, 34, 46), roll = easeOut(seg(f, 48, 62));
  let qx = q0[0], qy = q0[1], qr = 0;
  if (f >= 34 && f < 46) { qx = lerp(q0[0], 1180, fall); qy = q0[1] + (884 - q0[1]) * fall * fall; qr = fall * 200; }
  else if (f >= 46 && f < 48) { qx = 1180; qy = 884 - Math.sin(seg(f, 46, 48) * Math.PI) * 30; qr = 200; }
  else if (f >= 48) { qx = lerp(1180, CL[0] + 80, roll); qy = 884 - Math.abs(Math.sin(roll * Math.PI * 3)) * 18 * (1 - roll); qr = 200 - roll * 920; }
  const bonk = f >= 62 && f < 72;
  const pat = f >= 66 && f < 86;
  const patDown = pat ? Math.max(0, Math.sin((f - 66) / 3)) * 6 : 0;
  const walkK = easeInOut(seg(f, 96, 150));
  const OX = lerp(593, 1500, walkK);
  const wins = [0, 1, 2, 3, 4, 5].map((i) => (i === 2 ? 1 : seg(f, 70 + [0, 14, 0, 28, 42, 56][i], 78 + [0, 14, 0, 28, 42, 56][i])));
  return (
    <Frame f={f} seed={6168} bg={MP.nightDeep} dark>
      <g transform={cam(sc, fx, fy)}>
        <MachiNami f={f} sky={sky} windows={wins} />
        {/* 夜明けの光 (空の下のほうがほんのり橙) */}
        <rect x={-40} y={-40} width={2000} height={200} fill={MP.dawn} opacity={0.18 * seg(f, 60, 175)} />
        {/* 影絵の丸札 (謎の4か所) が NazoBell のまわりを回る */}
        {[0, 1, 2, 3].map((i) => {
          const a = ((i * 90 - 90 + f * 3) * Math.PI) / 180;
          const r = 300;
          const fade = 1 - seg(f, 70, 90);
          return fade > 0 ? (
            <g key={i} opacity={fade}>
              <MzGcSilBadge x={NB[0] + Math.cos(a) * r} y={NB[1] + Math.sin(a) * r * 0.55} kind={i} t={seg(f, 4 + i * 5, 12 + i * 5)} />
            </g>
          ) : null;
        })}
        {/* NazoBell (「?」が外れて「!」に) */}
        <NazoBell x={NB[0]} y={NB[1]} s={NS} f={f} solved={solved} />
        {/* 外れた「?」の札をかくす (solved 後に「!」の札が出るので、この上に落ちる「?」を描く) */}
        {f >= 30 && f < 36 && (
          <g stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round" opacity={1 - seg(f, 32, 36)}>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const a = (i / 6) * Math.PI * 2;
              return <line key={i} x1={q0[0] + Math.cos(a) * 70} y1={q0[1] + Math.sin(a) * 70} x2={q0[0] + Math.cos(a) * 100} y2={q0[1] + Math.sin(a) * 100} />;
            })}
          </g>
        )}
        {/* 玄関先の目覚まし時計 (老人の家) */}
        <BellClock x={CL[0]} y={CL[1] - 150 * 0.42 + patDown * 0.4} s={0.42} f={f} ring={0} time={235 + f / 30} alarm={225}
          rot={bonk ? Math.sin((f - 62) * 2) * 8 * (1 - (f - 62) / 10) : 0} />
        {bonk && <text x={CL[0] + 60} y={CL[1] - 110} fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white} stroke={C.ink} strokeWidth={3} paintOrder="stroke">コツン</text>}
        {/* 転がる「?」 */}
        {f >= 34 && (
          <g transform={`translate(${qx} ${qy}) rotate(${qr})`}>
            <circle r={26 * NS * 0.6} fill={MP.bell} stroke={C.ink} strokeWidth={5} />
            <text x={0} y={13 * NS * 0.6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38 * NS * 0.6} fill={KRP.white}>?</text>
          </g>
        )}
        {/* 老人: 時計をなでて、出かける */}
        <KnockerUp x={OX} y={900} s={0.9} f={f} pose="walk" old face="smile" />
        {pat && (
          <g>
            <path d={`M ${CL[0] - 20} ${CL[1] - 190 + patDown} q 0 -20 20 -20 q 20 0 20 20`} stroke={C.ink} strokeWidth={4} fill="none" />
            <text x={CL[0] - 50} y={CL[1] - 220} fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white} stroke={C.ink} strokeWidth={3} paintOrder="stroke">ぽん</text>
          </g>
        )}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  mz_157: (f) => <Mz157 f={f} />,
  mz_158: (f) => <Mz158 f={f} />,
  mz_159: (f) => <Mz159 f={f} />,
  mz_160: (f) => <Mz160 f={f} />,
  mz_161: (f) => <Mz161 f={f} />,
  mz_162: (f) => <Mz162 f={f} />,
  mz_163: (f) => <Mz163 f={f} />,
  mz_164: (f) => <Mz164 f={f} />,
  mz_165: (f) => <Mz165 f={f} />,
  mz_166: (f) => <Mz166 f={f} />,
  mz_167: (f) => <Mz167 f={f} />,
  mz_168: (f) => <Mz168 f={f} />,
};

export const MZ_GC_MOTIFS: string[] = [
  "mz_157", // #157
  "mz_158", // #158
  "mz_159", // #159
  "mz_160", // #160
  "mz_161", // #161
  "mz_162", // #162
  "mz_163", // #163
  "mz_164", // #164
  "mz_165", // #165
  "mz_166", // #166
  "mz_167", // #167
  "mz_168", // #168
];

export const mezaGcScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
