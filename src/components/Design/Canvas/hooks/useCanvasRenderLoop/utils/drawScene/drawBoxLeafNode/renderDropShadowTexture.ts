// types
import { TDrawSceneContext } from '../types';
import { TEffect, TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TRoundedRect } from 'utils/canvas/shapes/getRoundedRectPoints';

// utils
import { blurBoxEffectTexture } from './blurBoxEffectTexture';
import { createTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/createTarget';
import { disposeTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/disposeTarget';
import { drawEffectShapeFan } from './drawEffectShapeFan';
import { getBoxEffectTargetSize } from './getBoxEffectTargetSize';
import { getDropShadowMargin } from './getDropShadowMargin';
import { getDropShadowRect } from './getDropShadowRect';
import { getEffectBlurRadius } from './getEffectBlurRadius';
import { hexToRgbFloat } from 'utils/canvas/hexToRgbFloat';
import { setAlphaWriteEnabled } from 'utils/canvas/setAlphaWriteEnabled';

const drawShadowShape = (
  context: TDrawSceneContext,
  shadowRect: TRoundedRect,
  size: { height: number; width: number },
  color: [number, number, number],
): void => {
  if (shadowRect.width > 0 && shadowRect.height > 0) {
    drawEffectShapeFan(context.gl, context.program, context.buffer, shadowRect, size.width, size.height, [color[0], color[1], color[2], 1]);
  }
};

export const renderDropShadowTexture = (
  context: TDrawSceneContext,
  node: TFrameNode | TRectangleNode | TSectionNode,
  effect: TEffect,
): TRenderTarget => {
  const { gl, imageContext } = context;
  const margin = getDropShadowMargin(effect);
  const size = getBoxEffectTargetSize(node, margin);
  const shadowRect = getDropShadowRect(node, effect, margin);
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

  setAlphaWriteEnabled(gl, imageContext, true);

  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowTarget.framebuffer);
  gl.viewport(0, 0, size.width, size.height);
  gl.clearColor(color[0], color[1], color[2], 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  drawShadowShape(context, shadowRect, size, color);

  gl.blendFunc(gl.ONE, gl.ZERO);
  blurBoxEffectTexture(gl, imageContext, shadowTarget, tempTarget, getEffectBlurRadius(effect.blur));

  gl.bindFramebuffer(gl.FRAMEBUFFER, previousFramebuffer);
  gl.viewport(previousViewport[0], previousViewport[1], previousViewport[2], previousViewport[3]);
  setAlphaWriteEnabled(gl, imageContext, previousAlphaWriteEnabled);
  gl.blendFuncSeparate(...previousBlendFunc);

  disposeTarget(gl, tempTarget);

  return shadowTarget;
};
