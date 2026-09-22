// types
import { BlendMode } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TEffect, TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { blurBoxEffectTexture } from './blurBoxEffectTexture';
import { compositeMask } from '../compositeMask';
import { createTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/createTarget';
import { disposeTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/disposeTarget';
import { drawEffectShapeMask } from './drawEffectShapeMask';
import { drawEffectSilhouette } from './drawEffectSilhouette';
import { drawEffectTextureBlended } from './drawEffectTextureBlended';
import { getBoxEffectMargin } from './getBoxEffectMargin';
import { getBoxEffectShapeRect } from './getBoxEffectShapeRect';
import { getBoxEffectTargetSize } from './getBoxEffectTargetSize';
import { getEffectBlurRadius } from './getEffectBlurRadius';
import { getEffectHoleRect } from './getEffectHoleRect';
import { hexToRgbFloat } from 'utils/canvas/hexToRgbFloat';
import { setAlphaWriteEnabled } from 'utils/canvas/setAlphaWriteEnabled';

export const drawBoxInnerShadow = (
  context: TDrawSceneContext,
  node: TFrameNode | TRectangleNode,
  effect: TEffect,
  opacity: number,
  blendMode?: BlendMode,
): void => {
  const { gl, imageContext } = context;
  const margin = getBoxEffectMargin(effect.blur);
  const size = getBoxEffectTargetSize(node, margin);
  const shapeRect = getBoxEffectShapeRect(node, margin);
  const holeRect = getEffectHoleRect(node, effect, margin);
  const radius = getEffectBlurRadius(effect.blur);
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
  drawEffectSilhouette(gl, context.program, context.buffer, holeRect, size.width, size.height, color);
  gl.blendFunc(gl.ONE, gl.ZERO);

  gl.bindFramebuffer(gl.FRAMEBUFFER, maskTarget.framebuffer);
  gl.viewport(0, 0, size.width, size.height);
  drawEffectShapeMask(gl, context.program, context.buffer, shapeRect, size.width, size.height);

  blurBoxEffectTexture(gl, imageContext, shadowTarget, tempTarget, radius);

  gl.bindFramebuffer(gl.FRAMEBUFFER, tempTarget.framebuffer);
  gl.viewport(0, 0, size.width, size.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  compositeMask(context, shadowTarget.texture, maskTarget.texture);

  gl.bindFramebuffer(gl.FRAMEBUFFER, previousFramebuffer);
  gl.viewport(previousViewport[0], previousViewport[1], previousViewport[2], previousViewport[3]);
  setAlphaWriteEnabled(gl, imageContext, previousAlphaWriteEnabled);
  gl.blendFuncSeparate(...previousBlendFunc);

  drawEffectTextureBlended(
    context,
    tempTarget.texture,
    { height: size.height, width: size.width, x: node.x - margin, y: node.y - margin },
    node.rotation,
    (effect.opacity / 100) * opacity,
    blendMode,
  );

  disposeTarget(gl, shadowTarget);
  disposeTarget(gl, tempTarget);
  disposeTarget(gl, maskTarget);
};
