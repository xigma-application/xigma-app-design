// types
import { TMaskRenderer } from './types';

// utils
import { getDevicePixelWidth } from '../getDevicePixelWidth';
import { getEffectBlurRadius } from '../drawBoxLeafNode/getEffectBlurRadius';

export const getLayerBlurRadius = (renderer: TMaskRenderer, blur: number): number => {
  const { context, gl } = renderer;
  const pixelRatio = context.canvasWidth > 0 ? getDevicePixelWidth(context, gl) / context.canvasWidth : 1;

  return getEffectBlurRadius(blur * context.viewport.zoom * pixelRatio);
};
