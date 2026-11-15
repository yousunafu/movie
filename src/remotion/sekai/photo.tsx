// ===================================================================
// 実在の人物だけは写真を使う。
// 絵は SVG の中で組み立てているので <Img> は使えない。SVG の <image> を
// 使うが、それだけだとレンダが画像の読み込みを待たずに撮ってしまうので
// delayRender で待たせる。
// ===================================================================
import React from "react";
import { staticFile, delayRender, continueRender } from "remotion";

const usePhotoReady = (src: string) => {
  const [handle] = React.useState(() => delayRender(`photo ${src}`));
  React.useEffect(() => {
    const img = new Image();
    img.onload = () => continueRender(handle);
    img.onerror = () => continueRender(handle);
    img.src = src;
  }, [handle, src]);
};

export const SekaiPhoto: React.FC<{
  name: "homeini" | "hamenei";
  x: number;
  y: number;
  w: number;
  h: number;
  opacity?: number;
  clipId?: string;
}> = ({ name, x, y, w, h, opacity = 1, clipId }) => {
  const src = staticFile(`photos/${name}.png`);
  usePhotoReady(src);
  return (
    <image
      href={src}
      x={x}
      y={y}
      width={w}
      height={h}
      opacity={opacity}
      preserveAspectRatio="xMidYMid slice"
      clipPath={clipId ? `url(#${clipId})` : undefined}
    />
  );
};
