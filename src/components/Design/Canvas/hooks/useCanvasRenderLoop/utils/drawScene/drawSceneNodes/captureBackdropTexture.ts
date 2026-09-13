// types
import { TMaskRenderer } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

export const captureBackdropTexture = (renderer: TMaskRenderer): TRenderTarget => {
  const { gl, pool } = renderer;
  const backdrop = pool.acquire();

  gl.bindTexture(gl.TEXTURE_2D, backdrop.texture);
  gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, 0);
  gl.bindTexture(gl.TEXTURE_2D, null);

  return backdrop;
};
