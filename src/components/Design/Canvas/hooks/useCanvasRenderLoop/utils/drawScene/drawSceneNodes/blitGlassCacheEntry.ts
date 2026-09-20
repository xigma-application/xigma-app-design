// types
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TGlassCacheEntry, TScissorRect } from './types';

export const blitGlassCacheEntry = (gl: WebGL2RenderingContext, entry: TGlassCacheEntry, target: TRenderTarget, rect: TScissorRect): void => {
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, entry.framebuffer);
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, target.framebuffer);
  gl.blitFramebuffer(
    0,
    0,
    entry.width,
    entry.height,
    rect.x,
    rect.y,
    rect.x + rect.width,
    rect.y + rect.height,
    gl.COLOR_BUFFER_BIT,
    gl.NEAREST,
  );
};
