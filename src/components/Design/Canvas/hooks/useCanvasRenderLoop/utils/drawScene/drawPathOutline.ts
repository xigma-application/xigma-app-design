// others
import { DRAFT_FRAME_STROKE, HOVER_OUTLINE_WIDTH } from 'constant/canvas';

// types
import { TPathOutlineStyle } from './getPathOutlineStyles';
import { TPathNode, TViewport } from 'types/design/types';

// utils
import { drawDashedEllipseOutline } from 'utils/canvas/shapes/drawDashedEllipseOutline';
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';
import { drawThickEllipseOutline } from 'utils/canvas/shapes/drawThickEllipseOutline';

export const drawPathOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TPathNode,
  style: TPathOutlineStyle | undefined,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  switch (style) {
    case 'editing':
      drawDashedEllipseOutline(gl, program, buffer, node, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport, node.rotation);
      break;
    case 'hover':
      drawThickEllipseOutline(
        gl,
        program,
        buffer,
        node,
        DRAFT_FRAME_STROKE,
        HOVER_OUTLINE_WIDTH,
        canvasWidth,
        canvasHeight,
        viewport,
        node.rotation,
      );
      break;
    case 'selected':
      drawEllipse(gl, program, buffer, { ...node, stroke: DRAFT_FRAME_STROKE }, canvasWidth, canvasHeight, viewport, node.rotation);
      break;
    default:
      break;
  }
};
