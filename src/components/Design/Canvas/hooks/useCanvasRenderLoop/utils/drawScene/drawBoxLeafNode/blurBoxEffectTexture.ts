// types
import { TImageRenderContext } from '../../../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// types
import { TProgressiveBlurUniforms } from './types';

// utils
import { drawEffectBlurPass } from './drawEffectBlurPass';

export const blurBoxEffectTexture = (
  gl: WebGL2RenderingContext,
  imageContext: TImageRenderContext,
  source: TRenderTarget,
  temp: TRenderTarget,
  radius: number,
  progressive?: TProgressiveBlurUniforms,
  unpremultiply = false,
): void => {
  gl.bindFramebuffer(gl.FRAMEBUFFER, temp.framebuffer);
  gl.viewport(0, 0, temp.width, temp.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawEffectBlurPass(
    gl,
    imageContext.blurProgram,
    imageContext.blurBuffer,
    source.texture,
    [1, 0],
    radius,
    source.width,
    source.height,
    progressive,
    false,
  );

  gl.bindFramebuffer(gl.FRAMEBUFFER, source.framebuffer);
  gl.viewport(0, 0, source.width, source.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawEffectBlurPass(
    gl,
    imageContext.blurProgram,
    imageContext.blurBuffer,
    temp.texture,
    [0, 1],
    radius,
    temp.width,
    temp.height,
    progressive,
    unpremultiply,
  );
};
