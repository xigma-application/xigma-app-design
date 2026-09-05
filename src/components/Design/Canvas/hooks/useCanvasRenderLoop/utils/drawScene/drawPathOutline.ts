// others
import { DRAFT_FRAME_STROKE, HOVER_OUTLINE_WIDTH } from 'constant/canvas';

// types
import { TDrawContext } from './types';
import { TPathNode } from 'types/design/types';
import { TPathOutlineStyle } from './getPathOutlineStyles';

// utils
import { drawDashedEllipseOutline } from 'utils/canvas/shapes/drawDashedEllipseOutline';
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';
import { drawThickEllipseOutline } from 'utils/canvas/shapes/drawThickEllipseOutline';

export const drawPathOutline = (context: TDrawContext, node: TPathNode, style: TPathOutlineStyle | undefined): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

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
