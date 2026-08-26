// others
import { HOVER_OUTLINE_WIDTH, VECTOR_EDIT_OUTLINE_STROKE } from 'constant/canvas';

// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawVectorThickStrokeVertices } from 'utils/canvas/drawVectorNode/drawVectorThickStrokeVertices';
import { getVectorNodeThickStrokeVertices } from 'utils/canvas/vectorNetwork/getVectorNodeThickStrokeVertices/getVectorNodeThickStrokeVertices';

export const drawEditModeOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const strokeVertices = getVectorNodeThickStrokeVertices(node, HOVER_OUTLINE_WIDTH / viewport.zoom / 2);
  drawVectorThickStrokeVertices(gl, program, buffer, strokeVertices, VECTOR_EDIT_OUTLINE_STROKE, canvasWidth, canvasHeight, viewport);
};
