// types
import { TBlurCacheEntry, TScissorRect } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

export const blitBlurCacheEntry = (gl: WebGL2RenderingContext, entry: TBlurCacheEntry, target: TRenderTarget, rect: TScissorRect): void => {
  const x = rect.originX ?? rect.x;
  const y = rect.originY ?? rect.y;

  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, entry.framebuffer);
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, target.framebuffer);
  gl.blitFramebuffer(0, 0, entry.width, entry.height, x, y, x + entry.width, y + entry.height, gl.COLOR_BUFFER_BIT, gl.NEAREST);
};
