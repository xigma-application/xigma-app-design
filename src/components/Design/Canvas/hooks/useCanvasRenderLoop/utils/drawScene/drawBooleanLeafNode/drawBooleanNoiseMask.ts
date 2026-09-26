// types
import { TBooleanShape } from './types';
import { TDrawSceneContext } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { drawVectorFill } from 'utils/canvas/drawVectorNode/drawVectorFill';
import { getBooleanShapeLayers } from './getBooleanShapeLayers';
import { setAlphaWriteEnabled } from 'utils/canvas/setAlphaWriteEnabled';

export const drawBooleanNoiseMask = (context: TDrawSceneContext, shape: TBooleanShape): TRenderTarget => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const previousFramebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null;
  const previousViewport = gl.getParameter(gl.VIEWPORT) as Int32Array;
  const mask = imageContext.renderTargetPool.acquire();
  const previousBlendFunc = [
    gl.getParameter(gl.BLEND_SRC_RGB),
    gl.getParameter(gl.BLEND_DST_RGB),
    gl.getParameter(gl.BLEND_SRC_ALPHA),
    gl.getParameter(gl.BLEND_DST_ALPHA),
  ] as const;
  const previousAlphaWriteEnabled = imageContext.isAlphaWriteEnabled;

  gl.bindFramebuffer(gl.FRAMEBUFFER, mask.framebuffer);
  gl.viewport(0, 0, mask.width, mask.height);
  setAlphaWriteEnabled(gl, imageContext, true);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  getBooleanShapeLayers(shape).forEach(({ fillRule, polygons }) =>
    drawVectorFill(gl, program, buffer, null, null, polygons, '#ffffff', canvasWidth, canvasHeight, viewport, true, 1, fillRule),
  );

  gl.bindFramebuffer(gl.FRAMEBUFFER, previousFramebuffer);
  gl.viewport(previousViewport[0], previousViewport[1], previousViewport[2], previousViewport[3]);
  gl.blendFuncSeparate(...previousBlendFunc);
  setAlphaWriteEnabled(gl, imageContext, previousAlphaWriteEnabled);

  return mask;
};
