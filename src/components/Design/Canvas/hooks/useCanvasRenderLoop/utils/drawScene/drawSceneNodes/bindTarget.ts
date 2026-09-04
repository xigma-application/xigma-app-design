// types
import { TMaskRenderer } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { setAlphaWriteEnabled } from 'utils/canvas/setAlphaWriteEnabled';

export const bindTarget = (renderer: TMaskRenderer, target: TRenderTarget | null): void => {
  const { context, gl } = renderer;

  if (target) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
    gl.viewport(0, 0, target.width, target.height);
    setAlphaWriteEnabled(gl, context.imageContext, true);
  } else {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    setAlphaWriteEnabled(gl, context.imageContext, false);
  }
};
