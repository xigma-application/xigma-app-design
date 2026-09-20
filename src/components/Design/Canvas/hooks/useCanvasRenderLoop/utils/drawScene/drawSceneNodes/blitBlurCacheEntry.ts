// types
import { TBlurCacheEntry, TScissorRect } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

export const blitBlurCacheEntry = (
  gl: WebGL2RenderingContext,
  entry: TBlurCacheEntry,
  target: TRenderTarget,
  rect: TScissorRect,
  zoom: number,
): void => {
  const ratio = entry.clipped ? 1 : zoom / entry.zoom;
  const width = Math.round(entry.width * ratio);
  const height = Math.round(entry.height * ratio);
  const centerX = (rect.originX ?? rect.x) + (rect.rawWidth ?? rect.width) / 2;
  const centerY = (rect.originY ?? rect.y) + (rect.rawHeight ?? rect.height) / 2;
  const x = entry.clipped ? entry.x : Math.round(centerX - width / 2);
  const y = entry.clipped ? entry.y : Math.round(centerY - height / 2);

  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, entry.framebuffer);
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, target.framebuffer);
  gl.blitFramebuffer(
    0,
    0,
    entry.width,
    entry.height,
    x,
    y,
    x + width,
    y + height,
    gl.COLOR_BUFFER_BIT,
    ratio === 1 ? gl.NEAREST : gl.LINEAR,
  );
};
