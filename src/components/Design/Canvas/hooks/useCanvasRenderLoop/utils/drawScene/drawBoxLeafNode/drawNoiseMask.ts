// types
import { TDrawSceneContext } from '../types';
import { TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';
import { TPaint } from 'types/design/paint/types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { drawBoxPaints } from './drawBoxPaints';
import { drawThickOutline } from 'utils/canvas/drawThickOutline/drawThickOutline';
import { getBoxFillPolygon } from '../getBoxFillPolygon';
import { getBoxStrokeRingPolygons } from '../getBoxStrokeRingPolygons/getBoxStrokeRingPolygons';
import { setAlphaWriteEnabled } from 'utils/canvas/setAlphaWriteEnabled';

const MASK_PAINTS: TPaint[] = [{ color: '#ffffff', opacity: 100, type: 'solid' }];
const MASK_REFS = createCanvasRefs();

const drawMaskShapes = (context: TDrawSceneContext, node: TFrameNode | TRectangleNode | TSectionNode): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const nodesById = {};
  const pathOutlineStyles = new Map();

  drawBoxPaints(context, node, MASK_PAINTS, [getBoxFillPolygon(node)], 1, nodesById, pathOutlineStyles, MASK_REFS, null, 0);

  if ('strokeColor' in node && node.strokeColor && node.strokeWidth) {
    drawThickOutline(
      gl,
      program,
      buffer,
      node,
      '#ffffff',
      node.strokeWidth,
      canvasWidth,
      canvasHeight,
      viewport,
      node.rotation,
      node.strokeAlign,
      1,
    );
  }

  if (node.strokes && node.strokes.length > 0 && node.strokeWidth) {
    drawBoxPaints(context, node, MASK_PAINTS, getBoxStrokeRingPolygons(node), 1, nodesById, pathOutlineStyles, MASK_REFS, null, 0);
  }
};

export const drawNoiseMask = (context: TDrawSceneContext, node: TFrameNode | TRectangleNode | TSectionNode): TRenderTarget => {
  const { gl, imageContext } = context;
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
  drawMaskShapes(context, node);

  gl.bindFramebuffer(gl.FRAMEBUFFER, previousFramebuffer);
  gl.viewport(previousViewport[0], previousViewport[1], previousViewport[2], previousViewport[3]);
  gl.blendFuncSeparate(...previousBlendFunc);
  setAlphaWriteEnabled(gl, imageContext, previousAlphaWriteEnabled);

  return mask;
};
