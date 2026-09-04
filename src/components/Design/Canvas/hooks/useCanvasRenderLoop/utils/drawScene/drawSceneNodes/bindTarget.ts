// types
import { TMaskRenderer } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

export const bindTarget = (renderer: TMaskRenderer, target: TRenderTarget | null): void => {
  const { context, gl } = renderer;

  if (target) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
    gl.viewport(0, 0, target.width, target.height);
    gl.colorMask(true, true, true, true);
    context.imageContext.isAlphaWriteEnabled = true;
  } else {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.colorMask(true, true, true, false);
    context.imageContext.isAlphaWriteEnabled = false;
  }
};
