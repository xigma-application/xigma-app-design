// types
import { TMaskRenderer } from './types';

// utils
import { getEffectBlurRadius } from '../drawBoxLeafNode/getEffectBlurRadius';

export const getLayerBlurRadius = (renderer: TMaskRenderer, blur: number): number => {
  const { context, gl } = renderer;
  const pixelRatio = context.canvasWidth > 0 ? gl.drawingBufferWidth / context.canvasWidth : 1;

  return getEffectBlurRadius(blur * context.viewport.zoom * pixelRatio);
};
