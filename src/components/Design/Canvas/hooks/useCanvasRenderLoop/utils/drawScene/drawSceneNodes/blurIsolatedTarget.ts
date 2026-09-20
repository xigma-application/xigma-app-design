// types
import { TMaskRenderer } from './types';
import { TProgressiveBlurUniforms } from '../drawBoxLeafNode/types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { blurBoxEffectTexture } from '../drawBoxLeafNode/blurBoxEffectTexture';

export const blurIsolatedTarget = (
  renderer: TMaskRenderer,
  target: TRenderTarget,
  radius: number,
  progressive?: TProgressiveBlurUniforms,
): void => {
  const { context, gl, pool } = renderer;
  const temp = pool.acquire();

  gl.blendFunc(gl.ONE, gl.ZERO);
  blurBoxEffectTexture(gl, context.imageContext, target, temp, radius, progressive, true);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  pool.release(temp);
};
