// types
import { TMaskRenderer, TScissorRect } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

const copyFramebufferToBoundTexture = (gl: WebGL2RenderingContext, rect: TScissorRect | null): void => {
  if (rect) {
    gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, rect.x, rect.y, rect.x, rect.y, rect.width, rect.height);
  } else {
    gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, 0);
  }
};

export const captureBackdropTexture = (renderer: TMaskRenderer, rect: TScissorRect | null = null): TRenderTarget => {
  const { gl, pool } = renderer;
  const backdrop = pool.acquire();

  gl.bindTexture(gl.TEXTURE_2D, backdrop.texture);
  copyFramebufferToBoundTexture(gl, rect);
  gl.bindTexture(gl.TEXTURE_2D, null);

  return backdrop;
};
