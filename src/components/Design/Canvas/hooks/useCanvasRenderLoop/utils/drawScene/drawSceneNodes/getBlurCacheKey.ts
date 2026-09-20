// types
import { TMaskRenderer } from './types';
import { TSceneNode } from 'types/design/types';

export const getBlurCacheKey = (renderer: TMaskRenderer, node: TSceneNode): string => {
  const { context, gl } = renderer;

  return JSON.stringify([{ ...node, x: 0, y: 0 }, context.canvasWidth, gl.drawingBufferWidth, gl.drawingBufferHeight]);
};
