import type { SceneType } from "./style";

export type SceneItem = {
  label: string;
  value?: number;
  unit?: string;
};

export type Scene = {
  index: number;
  text: string; // ナレーション原文 = 字幕
  type: SceneType;
  motif: string; // 絵の題材 (motifs.ts の一覧から)
  emphasis?: string; // 強調する短い語
  title?: string; // 図解・チャートの見出し
  items?: SceneItem[]; // 図解のラベル / チャートの数値
  isEnding?: boolean;
  image?: string; // AI生成画像 (public/ 内の相対パス)。無ければSVGの絵で描く
  audio: string; // public/ 内の相対パス
  durationSec: number;
};

export type ScenesData = {
  scenes: Scene[];
  hasBgm: boolean;
  generatedAt: string;
  preset?: "genki" | "ashi" | "manabi" | "rekishi" | "kouzou" | "keizai"; // 作風。省略時は genki (従来通り)
};
