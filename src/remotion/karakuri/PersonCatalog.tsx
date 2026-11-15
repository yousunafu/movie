// 共通人物部品のカタログ (静止確認用の1枚絵)。
// 1列目: Person の7ポーズ / 2列目: 表情7種 / 3列目: PersonMini のバリエーション。
// 書き出し: npx remotion render src/remotion/index.ts PersonCatalog tmp/person-test/catalog --sequence --image-format=png --frames=45-45

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { KRP, KARAKURI_FONT, Person, PersonMini } from "./KarakuriScenes";

const W = 1920;
const H = 1080;
const FONT = KARAKURI_FONT;

const POSES = ["stand", "banzai", "raise", "point", "armsFolded", "run", "hold"] as const;
const FACES = ["normal", "worried", "surprised", "smile", "joy", "angry", "sad"] as const;
const MINIS = [
  { face: "dot", arms: "down", color: KRP.blue, s: 1, label: "dot" },
  { face: "smile", arms: "down", color: KRP.orange, s: 1, label: "smile" },
  { face: "none", arms: "down", color: KRP.grayDark, s: 1, label: "none" },
  { face: "dot", arms: "up", color: KRP.green, s: 1, label: "dot+up" },
  { face: "smile", arms: "up", color: KRP.yellow, s: 1, label: "smile+up" },
  { face: "none", arms: "up", color: KRP.blueDeep, s: 1, label: "none+up" },
  { face: "smile", arms: "up", color: KRP.red, s: 0.55, label: "s=0.55" },
] as const;

const colX = (i: number) => 137 + i * 274;

export const PersonCatalog: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* タイトルと行見出し */}
        <text x={W / 2} y={66} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>
          karakuri 共通人物部品カタログ
        </text>
        <text x={30} y={140} fontFamily={FONT} fontWeight={800} fontSize={28} fill={KRP.grayDark}>
          Person pose
        </text>
        <text x={30} y={480} fontFamily={FONT} fontWeight={800} fontSize={28} fill={KRP.grayDark}>
          Person face
        </text>
        <text x={30} y={788} fontFamily={FONT} fontWeight={800} fontSize={28} fill={KRP.grayDark}>
          PersonMini
        </text>

        {/* 1列目: 7ポーズ */}
        {POSES.map((pose, i) => (
          <g key={pose}>
            <Person x={colX(i)} y={360} s={0.58} pose={pose} face="normal" f={f} phase={i}
              pointDir={pose === "point" ? 1 : undefined} />
            <text x={colX(i)} y={398} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={26} fill={KRP.ink}>
              {pose}
            </text>
          </g>
        ))}

        {/* 2列目: 表情7種 */}
        {FACES.map((face, i) => (
          <g key={face}>
            <Person x={colX(i)} y={700} s={0.58} face={face} f={f} phase={i} />
            <text x={colX(i)} y={738} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={26} fill={KRP.ink}>
              {face}
            </text>
          </g>
        ))}

        {/* 3列目: PersonMini */}
        {MINIS.map((m, i) => (
          <g key={m.label}>
            <PersonMini x={colX(i)} y={1000} s={m.s} color={m.color} face={m.face} arms={m.arms} f={f} phase={i} />
            <text x={colX(i)} y={1036} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={24} fill={KRP.ink}>
              {m.label}
            </text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
