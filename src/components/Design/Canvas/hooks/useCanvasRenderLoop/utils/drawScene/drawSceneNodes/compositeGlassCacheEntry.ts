// types
import { TGlassCacheEntry, TMaskRenderer, TScissorRect } from './types';

// utils
import { compositeMask } from '../compositeMask';
import { getDevicePixelHeight } from '../getDevicePixelHeight';
import { getDevicePixelWidth } from '../getDevicePixelWidth';
import { setScissorRect } from './setScissorRect';

export const compositeGlassCacheEntry = (renderer: TMaskRenderer, entry: TGlassCacheEntry, rect: TScissorRect): void => {
  const { context, gl } = renderer;
  const drawingBufferWidth = getDevicePixelWidth(context, gl);
  const drawingBufferHeight = getDevicePixelHeight(context, gl);
  const scaleX = entry.rawWidth / (rect.rawWidth ?? rect.width);
  const scaleY = entry.rawHeight / (rect.rawHeight ?? rect.height);

  setScissorRect(gl, rect);
  compositeMask(context, entry.texture, entry.maskTexture, [
    (drawingBufferWidth * scaleX) / entry.width,
    (drawingBufferHeight * scaleY) / entry.height,
    (-(rect.originX ?? rect.x) * scaleX - entry.localX) / entry.width,
    (-(rect.originY ?? rect.y) * scaleY - entry.localY) / entry.height,
  ]);
  setScissorRect(gl, null);
};
