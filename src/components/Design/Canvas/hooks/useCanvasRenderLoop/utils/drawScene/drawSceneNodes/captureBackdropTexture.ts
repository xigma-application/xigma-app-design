// types
import { TDrawSceneContext } from '../types';
import { TMaskRenderer, TScissorRect } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { getDevicePixelHeight } from '../getDevicePixelHeight';
import { getDevicePixelWidth } from '../getDevicePixelWidth';

const copyFramebufferToBoundTexture = (context: TDrawSceneContext, gl: WebGL2RenderingContext, rect: TScissorRect | null): void => {
  if (rect) {
    gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, rect.x, rect.y, rect.x, rect.y, rect.width, rect.height);
  } else {
    gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, getDevicePixelWidth(context, gl), getDevicePixelHeight(context, gl), 0);
  }
};

export const captureBackdropTexture = (renderer: TMaskRenderer, rect: TScissorRect | null = null): TRenderTarget => {
  const { context, gl, pool } = renderer;
  const previousFramebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null;
  const backdrop = pool.acquire();

  gl.bindFramebuffer(gl.FRAMEBUFFER, previousFramebuffer);
  gl.bindTexture(gl.TEXTURE_2D, backdrop.texture);
  copyFramebufferToBoundTexture(context, gl, rect);
  gl.bindTexture(gl.TEXTURE_2D, null);

  return backdrop;
};
