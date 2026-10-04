// フラットイラストの部品集。実測パレット (白背景・低彩度・暖色基調) で描く。
import { useCurrentFrame } from "remotion";
import { PALETTE as P } from "../../style";

const INK = P.ink;
const SW = 5; // 基本の線幅

// ---------- シニアの人物 ----------
export const ElderlyPerson: React.FC<{ motif: string; size?: number }> = ({
  motif,
  size = 560,
}) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 14) * 5;
  const female = ["cooking", "shopping", "happy"].includes(motif);
  const sweater = female ? P.accentSoft : P.softBlue;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      style={{ transform: `translateY(${bob}px)` }}
    >
      {/* 足元の淡い影 */}
      <ellipse cx="200" cy="378" rx="120" ry="14" fill={P.warmBeige} opacity={0.6} />
      {/* 体 */}
      <path
        d={`M130 380 L130 250 Q130 210 200 210 Q270 210 270 250 L270 380 Z`}
        fill={sweater}
        stroke={INK}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      {/* 頭 */}
      <circle cx="200" cy="150" r="62" fill={P.skin} stroke={INK} strokeWidth={SW} />
      {/* 白髪 */}
      {female ? (
        <path
          d="M138 150 Q130 80 200 78 Q270 80 262 150 Q262 118 230 105 Q252 140 244 160 Q240 120 200 112 Q160 120 156 160 Q148 140 170 105 Q138 118 138 150 Z"
          fill={P.hair}
          stroke={INK}
          strokeWidth={4}
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M140 140 Q138 86 200 82 Q262 86 260 140 Q250 108 200 104 Q150 108 140 140 Z"
          fill={P.hair}
          stroke={INK}
          strokeWidth={4}
          strokeLinejoin="round"
        />
      )}
      {/* 顔 */}
      <circle cx="178" cy="150" r="5" fill={INK} />
      <circle cx="222" cy="150" r="5" fill={INK} />
      <path d="M186 176 Q200 186 214 176" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <circle cx="165" cy="168" r="9" fill={P.accentSoft} opacity={0.55} />
      <circle cx="235" cy="168" r="9" fill={P.accentSoft} opacity={0.55} />
      {/* 題材ごとの小道具 */}
      <Props motif={motif} />
    </svg>
  );
};

const Props: React.FC<{ motif: string }> = ({ motif }) => {
  switch (motif) {
    case "cooking":
      return (
        <g>
          <rect x="248" y="276" width="110" height="16" rx="8" fill={INK} />
          <path d="M268 230 Q300 216 330 230 L326 278 L276 278 Z" fill={P.warmBeige} stroke={INK} strokeWidth={SW} />
          <path d="M284 206 Q288 196 282 188 M302 206 Q306 196 300 188" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        </g>
      );
    case "eating":
      return (
        <g>
          <ellipse cx="310" cy="320" rx="58" ry="22" fill="#FFFFFF" stroke={INK} strokeWidth={SW} />
          <path d="M268 310 Q310 288 352 310" fill={P.softYellow} stroke={INK} strokeWidth={4} />
          <line x1="285" y1="250" x2="320" y2="296" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <line x1="298" y1="244" x2="328" y2="292" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        </g>
      );
    case "shopping":
      return (
        <g>
          <path d="M280 280 L350 280 L340 352 L290 352 Z" fill={P.softGreen} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M295 280 Q315 250 335 280" fill="none" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
          <circle cx="302" cy="270" r="10" fill={P.accent} stroke={INK} strokeWidth={3} />
          <path d="M322 262 L334 274 M322 274 L334 262" stroke={P.softYellow} strokeWidth={0} />
        </g>
      );
    case "thinking":
      return (
        <g>
          <circle cx="310" cy="96" r="30" fill="#FFFFFF" stroke={INK} strokeWidth={4} />
          <text x="310" y="108" textAnchor="middle" fontSize="36" fontWeight="bold" fill={P.accent}>?</text>
          <circle cx="276" cy="130" r="8" fill="#FFFFFF" stroke={INK} strokeWidth={3} />
        </g>
      );
    case "worried":
      return (
        <g>
          <path d="M292 120 Q300 134 292 146 Q282 134 292 120 Z" fill={P.softBlue} stroke={INK} strokeWidth={3} />
          <path d="M160 132 Q170 124 182 130 M218 130 Q230 124 240 132" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      );
    case "happy":
      return (
        <g>
          <path d="M96 70 L104 90 L124 92 L108 106 L114 126 L96 114 L78 126 L84 106 L68 92 L88 90 Z" fill={P.softYellow} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <path d="M310 90 L316 104 L330 106 L319 116 L323 130 L310 122 L297 130 L301 116 L290 106 L304 104 Z" fill={P.softYellow} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        </g>
      );
    case "walking":
      return (
        <g>
          <line x1="300" y1="250" x2="300" y2="372" stroke={INK} strokeWidth={7} strokeLinecap="round" />
          <path d="M290 250 Q300 238 312 248" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
        </g>
      );
    case "doctor":
      return (
        <g>
          <path d="M150 218 L200 290 L250 218 L250 380 L150 380 Z" fill="#FFFFFF" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <circle cx="200" cy="320" r="16" fill="none" stroke={INK} strokeWidth={4} />
          <path d="M184 250 Q184 290 200 304 M216 250 Q216 290 200 304" fill="none" stroke={INK} strokeWidth={4} />
        </g>
      );
    default: // talking
      return (
        <g>
          <path d="M296 240 Q330 232 338 258 Q346 284 316 288 L300 302 L302 284 Q290 278 290 260 Q290 246 296 240 Z" fill="#FFFFFF" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <circle cx="308" cy="262" r="4" fill={INK} />
          <circle cx="320" cy="262" r="4" fill={INK} />
        </g>
      );
  }
};

// ---------- 食品・物 ----------
export const FoodIcon: React.FC<{ motif: string; size?: number }> = ({
  motif,
  size = 420,
}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 300 300">
      <Food motif={motif} />
    </svg>
  );
};

const Food: React.FC<{ motif: string }> = ({ motif }) => {
  switch (motif) {
    case "vegetables":
      return (
        <g>
          <path d="M110 120 L90 250 Q88 266 104 264 L128 150 Z" fill="#E59A5C" stroke={INK} strokeWidth={SW} strokeLinejoin="round" transform="rotate(14 110 180)" />
          <path d="M112 112 Q100 86 112 70 M122 114 Q122 84 136 72 M130 120 Q142 94 160 92" stroke={P.softGreen} strokeWidth={8} fill="none" strokeLinecap="round" />
          <circle cx="196" cy="196" r="56" fill={P.accent} stroke={INK} strokeWidth={SW} />
          <path d="M196 148 Q186 132 170 136 M196 148 Q206 132 222 136 M196 148 L196 130" stroke={P.softGreen} strokeWidth={7} fill="none" strokeLinecap="round" />
        </g>
      );
    case "fish":
      return (
        <g>
          <path d="M50 160 Q120 90 210 130 Q240 142 252 160 Q240 178 210 190 Q120 230 50 160 Z" fill={P.softBlue} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M252 160 L290 128 L280 160 L290 192 Z" fill={P.softBlue} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <circle cx="92" cy="152" r="7" fill={INK} />
          <path d="M150 128 Q160 160 150 190" stroke={INK} strokeWidth={3.5} fill="none" />
        </g>
      );
    case "meat":
      return (
        <g>
          <path d="M80 110 Q170 60 220 120 Q260 170 210 210 Q150 252 100 210 Q52 168 80 110 Z" fill={P.accentSoft} stroke={INK} strokeWidth={SW} />
          <path d="M210 210 L252 252 M228 192 L268 228" stroke="#FFFFFF" strokeWidth={14} strokeLinecap="round" />
          <path d="M210 210 L252 252 M228 192 L268 228" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      );
    case "rice":
      return (
        <g>
          <path d="M60 160 L240 160 Q236 232 150 236 Q64 232 60 160 Z" fill="#FFFFFF" stroke={INK} strokeWidth={SW} />
          <path d="M80 160 Q90 110 150 104 Q210 110 220 160 Z" fill="#FDFBF7" stroke={INK} strokeWidth={SW} />
          <circle cx="120" cy="132" r="6" fill={P.warmBeige} />
          <circle cx="156" cy="122" r="6" fill={P.warmBeige} />
          <circle cx="186" cy="138" r="6" fill={P.warmBeige} />
        </g>
      );
    case "bread":
      return (
        <g>
          <path d="M60 130 Q60 90 110 90 L190 90 Q240 90 240 130 L240 220 L60 220 Z" fill={P.softYellow} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M60 150 L240 150" stroke={INK} strokeWidth={4} />
          <path d="M90 110 Q100 100 112 108" stroke={INK} strokeWidth={3} fill="none" />
        </g>
      );
    case "milk":
      return (
        <g>
          <path d="M105 70 L195 70 L195 95 L215 130 L215 240 L85 240 L85 130 L105 95 Z" fill="#FFFFFF" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M85 130 L215 130" stroke={INK} strokeWidth={4} />
          <rect x="110" y="155" width="80" height="50" rx="8" fill={P.softBlue} opacity={0.8} />
          <text x="150" y="190" textAnchor="middle" fontSize="30" fontWeight="bold" fill="#FFFFFF">牛乳</text>
        </g>
      );
    case "egg":
      return (
        <g>
          <path d="M150 60 Q210 120 210 180 Q210 240 150 240 Q90 240 90 180 Q90 120 150 60 Z" fill="#FDF6EC" stroke={INK} strokeWidth={SW} />
          <circle cx="128" cy="140" r="10" fill="#FFFFFF" opacity={0.9} />
        </g>
      );
    case "fruit":
      return (
        <g>
          <circle cx="150" cy="170" r="75" fill={P.accent} stroke={INK} strokeWidth={SW} />
          <path d="M150 98 Q146 76 128 70" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M150 92 Q176 70 196 86 Q180 104 150 92 Z" fill={P.softGreen} stroke={INK} strokeWidth={4} />
          <path d="M118 140 Q106 158 110 180" stroke="#FFFFFF" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.6} />
        </g>
      );
    case "tea":
      return (
        <g>
          <path d="M80 130 L220 130 L210 230 Q208 246 190 246 L110 246 Q92 246 90 230 Z" fill={P.softGreen} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M220 150 Q256 150 252 180 Q248 206 212 202" fill="none" stroke={INK} strokeWidth={SW} />
          <path d="M120 100 Q126 86 118 74 M150 102 Q158 86 150 70 M180 100 Q186 86 178 74" stroke={P.hair} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      );
    case "water":
      return (
        <g>
          <path d="M100 70 L200 70 L188 240 L112 240 Z" fill="#FFFFFF" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M106 130 L194 130 L188 240 L112 240 Z" fill={P.softBlue} opacity={0.5} />
          <path d="M126 160 Q136 170 126 182" stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      );
    case "natto":
      return (
        <g>
          <path d="M70 140 L230 140 L220 220 L80 220 Z" fill="#FFFFFF" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          {[110, 135, 160, 185].map((x, i) => (
            <circle key={i} cx={x + (i % 2) * 8} cy={150 + (i % 2) * 14} r="11" fill="#C9A86A" stroke={INK} strokeWidth={3} />
          ))}
          <path d="M100 138 Q130 110 160 136 Q190 108 212 138" stroke="#E8E0D0" strokeWidth={4} fill="none" />
        </g>
      );
    case "tofu":
      return (
        <g>
          <ellipse cx="150" cy="212" rx="105" ry="26" fill={P.softBlue} opacity={0.35} stroke={INK} strokeWidth={4} />
          <path d="M85 130 L215 130 L215 200 L85 200 Z" fill="#FFFFFF" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M85 130 L110 108 L240 108 L215 130 M215 200 L240 178 L240 108" fill="#FDFBF7" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        </g>
      );
    case "snack":
      return (
        <g>
          <circle cx="150" cy="160" r="80" fill={P.softYellow} stroke={INK} strokeWidth={SW} />
          {[[120, 130], [175, 120], [140, 180], [185, 180], [115, 200]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="9" fill="#8B6B4A" />
          ))}
        </g>
      );
    case "salt":
      return (
        <g>
          <path d="M110 110 Q110 70 150 70 Q190 70 190 110 L196 230 Q196 246 150 246 Q104 246 104 230 Z" fill="#FFFFFF" stroke={INK} strokeWidth={SW} />
          <circle cx="138" cy="92" r="4" fill={INK} />
          <circle cx="162" cy="92" r="4" fill={INK} />
          <circle cx="150" cy="80" r="4" fill={INK} />
          <rect x="116" y="150" width="68" height="44" rx="8" fill={P.softBlue} opacity={0.7} />
          <text x="150" y="182" textAnchor="middle" fontSize="26" fontWeight="bold" fill="#FFFFFF">塩</text>
        </g>
      );
    case "oil":
      return (
        <g>
          <path d="M130 70 L170 70 L170 100 L186 130 L186 236 Q186 248 150 248 Q114 248 114 236 L114 130 L130 100 Z" fill={P.softYellow} opacity={0.85} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <rect x="136" y="52" width="28" height="22" rx="4" fill={P.warmBeige} stroke={INK} strokeWidth={4} />
        </g>
      );
    case "supplement":
      return (
        <g>
          <path d="M100 100 L200 100 L200 230 Q200 244 150 244 Q100 244 100 230 Z" fill="#FFFFFF" stroke={INK} strokeWidth={SW} />
          <rect x="112" y="72" width="76" height="30" rx="6" fill={P.softGreen} stroke={INK} strokeWidth={4} />
          <ellipse cx="134" cy="170" rx="16" ry="10" fill={P.accentSoft} stroke={INK} strokeWidth={3} transform="rotate(-24 134 170)" />
          <ellipse cx="168" cy="192" rx="16" ry="10" fill={P.softYellow} stroke={INK} strokeWidth={3} transform="rotate(18 168 192)" />
        </g>
      );
    default:
      return (
        <g>
          <circle cx="150" cy="160" r="80" fill={P.warmBeige} stroke={INK} strokeWidth={SW} />
        </g>
      );
  }
};

// ---------- 風景 ----------
export const Scenery: React.FC<{ motif: string }> = ({ motif }) => {
  switch (motif) {
    case "supermarket":
      return (
        <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
          <rect width="1920" height="1080" fill={P.background} />
          <rect x="200" y="140" width="1520" height="110" rx="16" fill={P.accentSoft} stroke={INK} strokeWidth={6} />
          <text x="960" y="215" textAnchor="middle" fontSize="64" fontWeight="bold" fill="#FFFFFF" fontFamily="sans-serif">スーパーマーケット</text>
          {[0, 1, 2].map((row) => (
            <g key={row}>
              <rect x={260} y={330 + row * 200} width={1400} height={24} fill={P.warmBeige} stroke={INK} strokeWidth={5} />
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <rect
                  key={i}
                  x={300 + i * 170}
                  y={330 + row * 200 - 90}
                  width={110}
                  height={86}
                  rx={10}
                  fill={[P.softGreen, P.softYellow, P.accentSoft, P.softBlue][(i + row) % 4]}
                  opacity={0.75}
                  stroke={INK}
                  strokeWidth={4}
                />
              ))}
            </g>
          ))}
        </svg>
      );
    case "kitchen":
      return (
        <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
          <rect width="1920" height="1080" fill={P.backgroundAlt} />
          <rect x="1280" y="160" width="420" height="320" rx="14" fill="#FDFBF7" stroke={INK} strokeWidth={6} />
          <line x1="1490" y1="160" x2="1490" y2="480" stroke={INK} strokeWidth={5} />
          <path d="M1300 420 Q1360 350 1420 400 Q1480 440 1530 390" stroke={P.softGreen} strokeWidth={8} fill="none" />
          <circle cx="1620" cy="240" r="40" fill={P.softYellow} opacity={0.9} />
          <rect x="120" y="620" width="1680" height="60" fill={P.warmBeige} stroke={INK} strokeWidth={6} />
          <rect x="120" y="680" width="1680" height="300" fill="#EFE6D8" stroke={INK} strokeWidth={6} />
          <rect x="420" y="700" width="300" height="240" rx="10" fill="#FDFBF7" stroke={INK} strokeWidth={5} />
          <path d="M860 560 L1120 560 L1100 620 L880 620 Z" fill="#D9D2C7" stroke={INK} strokeWidth={6} />
          <path d="M930 520 Q936 498 924 480 M990 520 Q998 496 986 476 M1050 520 Q1056 498 1044 480" stroke={P.hair} strokeWidth={7} fill="none" strokeLinecap="round" />
        </svg>
      );
    case "park":
      return (
        <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
          <rect width="1920" height="1080" fill={P.background} />
          <circle cx="1600" cy="220" r="90" fill={P.softYellow} opacity={0.85} stroke={INK} strokeWidth={5} />
          <path d="M0 860 Q480 800 960 850 Q1440 900 1920 840 L1920 1080 L0 1080 Z" fill={P.softGreen} opacity={0.5} />
          {[300, 700, 1300].map((x, i) => (
            <g key={i}>
              <rect x={x - 18} y={560} width={36} height={220} fill="#A98B66" stroke={INK} strokeWidth={5} />
              <circle cx={x} cy={480} r={130} fill={P.softGreen} stroke={INK} strokeWidth={6} />
            </g>
          ))}
          <path d="M500 1080 Q960 900 1500 1080" fill={P.warmBeige} stroke={INK} strokeWidth={5} />
        </svg>
      );
    default: // home
      return (
        <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
          <rect width="1920" height="1080" fill={P.backgroundAlt} />
          <rect x="1300" y="160" width="400" height="330" rx="14" fill="#FDFBF7" stroke={INK} strokeWidth={6} />
          <line x1="1500" y1="160" x2="1500" y2="490" stroke={INK} strokeWidth={5} />
          <line x1="1300" y1="325" x2="1700" y2="325" stroke={INK} strokeWidth={5} />
          <ellipse cx="960" cy="880" rx="560" ry="60" fill={P.warmBeige} opacity={0.7} />
          <rect x="520" y="620" width="880" height="44" rx="10" fill="#C9A86A" stroke={INK} strokeWidth={6} />
          <rect x="580" y="664" width="40" height="200" fill="#B08F5E" stroke={INK} strokeWidth={5} />
          <rect x="1300" y="664" width="40" height="200" fill="#B08F5E" stroke={INK} strokeWidth={5} />
          <ellipse cx="820" cy="600" rx="90" ry="26" fill="#FFFFFF" stroke={INK} strokeWidth={5} />
          <path d="M1060 560 Q1066 540 1056 524" stroke={P.hair} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M1020 600 L1120 600 L1108 568 L1032 568 Z" fill={P.softYellow} stroke={INK} strokeWidth={5} />
        </svg>
      );
  }
};
