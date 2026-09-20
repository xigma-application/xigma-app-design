// types
import { TMaskRenderer, TScissorRect } from './types';
import { TProgressiveBlurUniforms } from '../drawBoxLeafNode/types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { blurBoxEffectTexture } from '../drawBoxLeafNode/blurBoxEffectTexture';
import { EFFECT_BLUR_MAX_PX } from '../drawBoxLeafNode/constants';
import { expandScissorRect } from './expandScissorRect';
import { setScissorRect } from './setScissorRect';

export const blurIsolatedTarget = (
  renderer: TMaskRenderer,
  target: TRenderTarget,
  radius: number,
  progressive?: TProgressiveBlurUniforms,
  rect: TScissorRect | null = null,
): void => {
  const { context, gl, pool } = renderer;
  const temp = pool.acquire();

  gl.bindFramebuffer(gl.FRAMEBUFFER, temp.framebuffer);
  setScissorRect(gl, rect && expandScissorRect(gl, rect, EFFECT_BLUR_MAX_PX));
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  setScissorRect(gl, rect);
  gl.blendFunc(gl.ONE, gl.ZERO);
  blurBoxEffectTexture(gl, context.imageContext, target, temp, radius, progressive, true);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  setScissorRect(gl, null);

  pool.release(temp);
};
