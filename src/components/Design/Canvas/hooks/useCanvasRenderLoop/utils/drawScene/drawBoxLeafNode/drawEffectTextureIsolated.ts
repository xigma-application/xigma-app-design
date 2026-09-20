// types
import { BlendMode } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// utils
import { compositeBlend } from '../compositeBlend';
import { drawEffectTexture } from './drawEffectTexture';
import { setAlphaWriteEnabled } from 'utils/canvas/setAlphaWriteEnabled';

export const drawEffectTextureIsolated = (
  context: TDrawSceneContext,
  texture: WebGLTexture,
  rect: TDraftRect,
  rotation: number,
  opacity: number,
  blendMode: BlendMode,
): void => {
  const { gl, imageContext } = context;
  const pool = imageContext.renderTargetPool;
  const previousFramebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null;
  const previousViewport = gl.getParameter(gl.VIEWPORT) as Int32Array;
  const previousBlendFunc = [
    gl.getParameter(gl.BLEND_SRC_RGB),
    gl.getParameter(gl.BLEND_DST_RGB),
    gl.getParameter(gl.BLEND_SRC_ALPHA),
    gl.getParameter(gl.BLEND_DST_ALPHA),
  ] as [number, number, number, number];
  const previousAlphaWriteEnabled = imageContext.isAlphaWriteEnabled;
  const backdrop = pool.acquire();

  gl.bindTexture(gl.TEXTURE_2D, backdrop.texture);
  gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, 0);
  gl.bindTexture(gl.TEXTURE_2D, null);

  const contentTarget = pool.acquire();

  gl.bindFramebuffer(gl.FRAMEBUFFER, contentTarget.framebuffer);
  gl.viewport(0, 0, contentTarget.width, contentTarget.height);
  setAlphaWriteEnabled(gl, imageContext, true);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  drawEffectTexture(context, texture, rect, rotation, opacity);

  gl.bindFramebuffer(gl.FRAMEBUFFER, previousFramebuffer);
  gl.viewport(previousViewport[0], previousViewport[1], previousViewport[2], previousViewport[3]);
  gl.blendFuncSeparate(...previousBlendFunc);
  setAlphaWriteEnabled(gl, imageContext, previousAlphaWriteEnabled);

  compositeBlend(context, contentTarget.texture, backdrop.texture, blendMode);

  pool.release(contentTarget);
  pool.release(backdrop);
};
