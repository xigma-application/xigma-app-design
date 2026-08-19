// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawCornerHandles } from 'utils/canvas/drawCornerHandles';
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';

export const drawVectorSelectionOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  vectorEditingNodeId: string | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (node.id !== vectorEditingNodeId) {
    const bounds = getVectorNodeBounds(node);

    drawRect(gl, program, buffer, { ...bounds, stroke: DRAFT_FRAME_STROKE }, canvasWidth, canvasHeight, viewport, node.rotation);
    drawCornerHandles(gl, program, buffer, bounds, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport, node.rotation);
  }
};
