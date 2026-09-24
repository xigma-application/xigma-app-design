// types
import { TBooleanShape } from './types';
import { TDrawSceneContext } from '../types';
import { TEffect } from 'types/design/types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { blurBoxEffectTexture } from '../drawBoxLeafNode/blurBoxEffectTexture';
import { compositeMask } from '../compositeMask';
import { createTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/createTarget';
import { disposeTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/disposeTarget';
import { drawBooleanShapeFill } from './drawBooleanShapeFill';
import { getBoxEffectMargin } from '../drawBoxLeafNode/getBoxEffectMargin';
import { getBoxEffectTargetSize } from '../drawBoxLeafNode/getBoxEffectTargetSize';
import { getEffectBlurRadius } from '../drawBoxLeafNode/getEffectBlurRadius';
import { hexToRgbFloat } from 'utils/canvas/hexToRgbFloat';
import { setAlphaWriteEnabled } from 'utils/canvas/setAlphaWriteEnabled';

export const renderBooleanInnerShadowTexture = (context: TDrawSceneContext, shape: TBooleanShape, effect: TEffect): TRenderTarget => {
  const { gl, imageContext } = context;
  const margin = getBoxEffectMargin(effect.blur);
  const size = getBoxEffectTargetSize(shape.bounds, margin);
  const origin = { x: shape.bounds.x - margin, y: shape.bounds.y - margin };
  const color = hexToRgbFloat(effect.color);
  const previousFramebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null;
  const previousViewport = gl.getParameter(gl.VIEWPORT) as Int32Array;
  const previousAlphaWriteEnabled = imageContext.isAlphaWriteEnabled;
  const previousBlendFunc = [
    gl.getParameter(gl.BLEND_SRC_RGB),
    gl.getParameter(gl.BLEND_DST_RGB),
    gl.getParameter(gl.BLEND_SRC_ALPHA),
    gl.getParameter(gl.BLEND_DST_ALPHA),
  ] as [number, number, number, number];
  const shadowTarget = createTarget(gl, size.width, size.height);
  const tempTarget = createTarget(gl, size.width, size.height);
  const maskTarget = createTarget(gl, size.width, size.height);

  setAlphaWriteEnabled(gl, imageContext, true);

  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowTarget.framebuffer);
  gl.viewport(0, 0, size.width, size.height);
  gl.clearColor(color[0], color[1], color[2], 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.blendFuncSeparate(gl.ZERO, gl.ONE, gl.ZERO, gl.ZERO);
  drawBooleanShapeFill(context, shape, size, { x: origin.x - effect.x, y: origin.y - effect.y }, '#000000', 0);
  gl.blendFunc(gl.ONE, gl.ZERO);

  gl.bindFramebuffer(gl.FRAMEBUFFER, maskTarget.framebuffer);
  gl.viewport(0, 0, size.width, size.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawBooleanShapeFill(context, shape, size, origin, '#ffffff', 1);

  blurBoxEffectTexture(gl, imageContext, shadowTarget, tempTarget, getEffectBlurRadius(effect.blur));

  gl.bindFramebuffer(gl.FRAMEBUFFER, tempTarget.framebuffer);
  gl.viewport(0, 0, size.width, size.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  compositeMask(context, shadowTarget.texture, maskTarget.texture);

  gl.bindFramebuffer(gl.FRAMEBUFFER, previousFramebuffer);
  gl.viewport(previousViewport[0], previousViewport[1], previousViewport[2], previousViewport[3]);
  setAlphaWriteEnabled(gl, imageContext, previousAlphaWriteEnabled);
  gl.blendFuncSeparate(...previousBlendFunc);

  disposeTarget(gl, shadowTarget);
  disposeTarget(gl, maskTarget);

  return tempTarget;
};
