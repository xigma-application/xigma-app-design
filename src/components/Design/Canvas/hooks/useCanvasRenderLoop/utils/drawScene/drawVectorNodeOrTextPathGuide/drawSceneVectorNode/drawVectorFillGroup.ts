// types
import { BlendMode } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';
import { TDrawSceneContext } from '../../types';
import { TPaint } from 'types/design/paint/types';

// utils
import { compositeBlend } from '../../compositeBlend';
import { drawVectorFillPaints } from 'utils/canvas/drawVectorNode/drawVectorFillPaints';
import { getFaceGroupBlendMode } from './getFaceGroupBlendMode';
import { setAlphaWriteEnabled } from 'utils/canvas/setAlphaWriteEnabled';
import { TPatternSourceTile } from 'utils/canvas/drawVectorNode/drawVectorPatternSourceTile';

const drawIsolatedFillGroup = (
  context: TDrawSceneContext,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer> | null,
  nodeBounds: TDraftRect | null,
  polygons: TPoint[][],
  paint: TPaint[],
  patternSourceTiles: (TPatternSourceTile | null)[],
  blendMode: BlendMode,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const pool = imageContext.renderTargetPool;
  const previousFramebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null;
  const previousViewport = gl.getParameter(gl.VIEWPORT) as Int32Array;
  const previousBlendFunc = [
    gl.getParameter(gl.BLEND_SRC_RGB),
    gl.getParameter(gl.BLEND_DST_RGB),
    gl.getParameter(gl.BLEND_SRC_ALPHA),
    gl.getParameter(gl.BLEND_DST_ALPHA),
  ] as const;
  const previousAlphaWriteEnabled = imageContext.isAlphaWriteEnabled;
  const backdrop = pool.acquire();

  gl.bindTexture(gl.TEXTURE_2D, backdrop.texture);
  gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, 0);
  gl.bindTexture(gl.TEXTURE_2D, null);

  const contentTarget = pool.acquire();

  gl.bindFramebuffer(gl.FRAMEBUFFER, contentTarget.framebuffer);
  gl.viewport(0, 0, contentTarget.width, contentTarget.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  setAlphaWriteEnabled(gl, imageContext, true);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  drawVectorFillPaints(
    gl,
    program,
    imageContext.gradientProgram,
    imageContext.patternTileProgram,
    buffer,
    faceBufferCache,
    nodeBounds,
    polygons,
    paint,
    patternSourceTiles,
    canvasWidth,
    canvasHeight,
    viewport,
    true,
  );

  gl.bindFramebuffer(gl.FRAMEBUFFER, previousFramebuffer);
  gl.viewport(previousViewport[0], previousViewport[1], previousViewport[2], previousViewport[3]);
  gl.blendFuncSeparate(...previousBlendFunc);
  setAlphaWriteEnabled(gl, imageContext, previousAlphaWriteEnabled);

  compositeBlend(context, contentTarget.texture, backdrop.texture, blendMode);

  pool.release(contentTarget);
  pool.release(backdrop);
};

export const drawVectorFillGroup = (
  context: TDrawSceneContext,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer> | null,
  nodeBounds: TDraftRect | null,
  polygons: TPoint[][],
  paint: TPaint[],
  patternSourceTiles: (TPatternSourceTile | null)[] = [],
): void => {
  const blendMode = getFaceGroupBlendMode(paint);

  if (blendMode) {
    drawIsolatedFillGroup(context, faceBufferCache, nodeBounds, polygons, paint, patternSourceTiles, blendMode);
  } else {
    const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;

    drawVectorFillPaints(
      gl,
      program,
      imageContext.gradientProgram,
      imageContext.patternTileProgram,
      buffer,
      faceBufferCache,
      nodeBounds,
      polygons,
      paint,
      patternSourceTiles,
      canvasWidth,
      canvasHeight,
      viewport,
      imageContext.isAlphaWriteEnabled,
    );
  }
};
