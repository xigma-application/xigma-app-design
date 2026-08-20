// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { getVectorMultiSelectBounds } from 'utils/canvas/vectorNetwork/getVectorMultiSelectBounds';

export const drawVectorMultiSelectBox = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  selectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (selectedVertexIds.length + selectedHandles.length > 1) {
    const bounds = getVectorMultiSelectBounds(node, selectedVertexIds, selectedHandles);

    if (bounds) {
      drawRect(gl, program, buffer, { ...bounds, stroke: DRAFT_FRAME_STROKE }, canvasWidth, canvasHeight, viewport, 0);
    }
  }
};
