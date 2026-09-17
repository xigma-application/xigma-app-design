// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from './types';
import { TPathOutlineStyle } from './getPathOutlineStyles';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawLeafNode } from './drawLeafNode';
import { setAlphaWriteEnabled } from 'utils/canvas/setAlphaWriteEnabled';
import { TPatternSourceTile } from 'utils/canvas/drawVectorNode/drawVectorPatternSourceTile';

export type TResolvedPatternSourceTile = { release: () => void; tile: TPatternSourceTile };

const getPatternSourceCaptureViewport = (bounds: TDraftRect, canvasWidth: number, canvasHeight: number): TViewport => {
  const zoom = Math.min(canvasWidth / bounds.width, canvasHeight / bounds.height);
  return { x: -bounds.x * zoom, y: -bounds.y * zoom, zoom };
};

export const renderNodeListToPatternSourceTile = (
  context: TDrawSceneContext,
  subtree: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  editingPathId: string | null | undefined,
  patternSourceDepth: number,
  bounds: TDraftRect,
): TResolvedPatternSourceTile => {
  const { gl, imageContext } = context;
  const pool = imageContext.renderTargetPool;
  const target = pool.acquire();
  const previousFramebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null;
  const previousViewport = gl.getParameter(gl.VIEWPORT) as Int32Array;
  const previousAlphaWriteEnabled = imageContext.isAlphaWriteEnabled;
  const previousBlendFunc = [
    gl.getParameter(gl.BLEND_SRC_RGB),
    gl.getParameter(gl.BLEND_DST_RGB),
    gl.getParameter(gl.BLEND_SRC_ALPHA),
    gl.getParameter(gl.BLEND_DST_ALPHA),
  ] as const;
  const previousContextViewport = context.viewport;
  const captureViewport = getPatternSourceCaptureViewport(bounds, context.canvasWidth, context.canvasHeight);

  gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
  gl.viewport(0, 0, target.width, target.height);
  setAlphaWriteEnabled(gl, imageContext, true);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  context.viewport = captureViewport;

  subtree.forEach((node) => {
    drawLeafNode(context, node, pathOutlineStyles, refs, nodesById, editingPathId, patternSourceDepth + 1);
  });

  context.viewport = previousContextViewport;
  gl.bindFramebuffer(gl.FRAMEBUFFER, previousFramebuffer);
  gl.viewport(previousViewport[0], previousViewport[1], previousViewport[2], previousViewport[3]);
  gl.blendFuncSeparate(...previousBlendFunc);
  setAlphaWriteEnabled(gl, imageContext, previousAlphaWriteEnabled);

  return {
    release: () => pool.release(target),
    tile: { height: bounds.height, texture: target.texture, viewport: captureViewport, width: bounds.width, x: bounds.x, y: bounds.y },
  };
};
