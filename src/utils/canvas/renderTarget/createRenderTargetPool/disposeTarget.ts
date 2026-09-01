// types
import { TRenderTarget } from './types';

export const disposeTarget = (gl: WebGL2RenderingContext, target: TRenderTarget): void => {
  gl.deleteFramebuffer(target.framebuffer);
  gl.deleteTexture(target.texture);
  gl.deleteRenderbuffer(target.stencil);
};
