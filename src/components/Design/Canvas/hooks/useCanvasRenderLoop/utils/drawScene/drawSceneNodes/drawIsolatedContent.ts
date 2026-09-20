// types
import { TMaskRenderer } from './types';

// utils
import { drawEffectTexture } from '../drawBoxLeafNode/drawEffectTexture';

export const drawIsolatedContent = (renderer: TMaskRenderer, texture: WebGLTexture): void => {
  const { context } = renderer;
  const { canvasHeight, canvasWidth, viewport } = context;

  drawEffectTexture(
    context,
    texture,
    {
      height: canvasHeight / viewport.zoom,
      width: canvasWidth / viewport.zoom,
      x: -viewport.x / viewport.zoom,
      y: -viewport.y / viewport.zoom,
    },
    0,
    1,
  );
};
