// 「夜の深掘りチャンネル」試作の確認用。1場面 150フレーム (5秒) を順番につなぐ。本編とは無関係。
// 静止画: npx remotion still src/remotion/index.ts YoruTest tmp/yoru/sA.png --frame=125
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SaveA } from "./YoruSaveA";
import { SaveB } from "./YoruSaveB";
import { SaveC } from "./YoruSaveC";
import { NameA } from "./YoruNameA";
import { NameB } from "./YoruNameB";
import { NameC } from "./YoruNameC";
import { MoodCtx, YoruMood } from "./YoruShared";
import { NoteNameA, NoteNameB, NoteNameC } from "./YoruNoteName";

const SCENES: React.FC<{ f: number }>[] = [SaveA, SaveB, SaveC, NameA, NameB, NameC];
export const YORU_SCENE_LEN = 150;
export const YORU_TEST_FRAMES = SCENES.length * YORU_SCENE_LEN;

export const YoruTest: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(Math.floor(frame / YORU_SCENE_LEN), SCENES.length - 1);
  const S = SCENES[i];
  return (
    <AbsoluteFill style={{ background: "#11151F" }}>
      <S f={frame - i * YORU_SCENE_LEN} />
    </AbsoluteFill>
  );
};

// 名前回の別案「夕暮れのからくり」(同じ3場面を dusk の作風で)
const DUSK_SCENES: React.FC<{ f: number }>[] = [NameA, NameB, NameC];
export const YORU_DUSK_FRAMES = DUSK_SCENES.length * YORU_SCENE_LEN;
export const YoruDusk: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(Math.floor(frame / YORU_SCENE_LEN), DUSK_SCENES.length - 1);
  const S = DUSK_SCENES[i];
  return (
    <MoodCtx.Provider value="dusk">
      <AbsoluteFill style={{ background: "#3A2420" }}>
        <S f={frame - i * YORU_SCENE_LEN} />
      </AbsoluteFill>
    </MoodCtx.Provider>
  );
};

// ゆる落書きノート版 (2026-11-16 試作)
const makeSet = (scenes: React.FC<{ f: number }>[], mood: YoruMood, bg: string): React.FC => () => {
  const frame = useCurrentFrame();
  const i = Math.min(Math.floor(frame / YORU_SCENE_LEN), scenes.length - 1);
  const S = scenes[i];
  return (
    <MoodCtx.Provider value={mood}>
      <AbsoluteFill style={{ background: bg }}>
        <S f={frame - i * YORU_SCENE_LEN} />
      </AbsoluteFill>
    </MoodCtx.Provider>
  );
};
export const YoruNoteSave = makeSet([SaveA, SaveB, SaveC], "note", "#FBFAF4");
export const YoruNoteName = makeSet([NoteNameA, NoteNameB, NoteNameC], "note", "#FBFAF4");
export const YORU_NOTE_FRAMES = 3 * YORU_SCENE_LEN;

// ===== セーブ回の作画パターン (2026-11-18 試作)。今の夜版 (YoruTest) はそのまま残す =====
// flat = 灯りを描かない夜 (光のにじみ・縁取りの光・ホコリ・粒をやめ、光はふちのはっきりした面で置く)
// day  = 昼のからくり (明るい部屋・光の演出なし・字幕はからくりの帯)
export const YoruFlatSave = makeSet([SaveA, SaveB, SaveC], "flat", "#232A3B");
export const YoruDaySave = makeSet([SaveA, SaveB, SaveC], "day", "#EFE3C8");
export const YORU_SAVE_SET_FRAMES = 3 * YORU_SCENE_LEN;

// print = 昭和の学習図鑑 (昼の絵を、紙に刷ったような色味と版ずれ・網点で仕上げる)
const PrintInner = makeSet([SaveA, SaveB, SaveC], "print", "#EFE3C8");
export const YoruPrintSave: React.FC = () => (
  <AbsoluteFill style={{ background: "#F1E7D0" }}>
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <defs>
        <filter id="yprintAll" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          {/* 色を少しくすませ、黒を焦げ茶のインクに、白を紙の色に寄せる */}
          <feColorMatrix in="SourceGraphic" type="saturate" values="0.72" result="sat" />
          <feComponentTransfer in="sat" result="toned">
            <feFuncR type="table" tableValues="0.17 0.97" />
            <feFuncG type="table" tableValues="0.14 0.93" />
            <feFuncB type="table" tableValues="0.12 0.83" />
          </feComponentTransfer>
          {/* 版ずれ: 赤の版だけ少しずらす */}
          <feColorMatrix in="toned" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx="3" dy="1.5" result="ro" />
          <feColorMatrix in="toned" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb" />
          <feComposite in="ro" in2="gb" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
        </filter>
      </defs>
    </svg>
    <AbsoluteFill style={{ filter: "url(#yprintAll)" }}>
      <PrintInner />
    </AbsoluteFill>
  </AbsoluteFill>
);
