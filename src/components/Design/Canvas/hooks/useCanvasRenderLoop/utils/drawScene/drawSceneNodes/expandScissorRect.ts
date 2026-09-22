// types
import { TDrawSceneContext } from '../types';
import { TScissorRect } from './types';

// utils
import { getDevicePixelHeight } from '../getDevicePixelHeight';
import { getDevicePixelWidth } from '../getDevicePixelWidth';

export const expandScissorRect = (
  context: TDrawSceneContext,
  gl: WebGL2RenderingContext,
  rect: TScissorRect,
  amount: number,
): TScissorRect => {
  const left = Math.max(0, rect.x - amount);
  const bottom = Math.max(0, rect.y - amount);
  const right = Math.min(getDevicePixelWidth(context, gl), rect.x + rect.width + amount);
  const top = Math.min(getDevicePixelHeight(context, gl), rect.y + rect.height + amount);

  return { height: top - bottom, width: right - left, x: left, y: bottom };
};
