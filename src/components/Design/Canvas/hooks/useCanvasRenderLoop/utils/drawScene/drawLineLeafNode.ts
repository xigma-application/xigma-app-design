// others
import { LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';

// types
import { TDrawContext } from './types';
import { TLineNode } from 'types/design/types';

// utils
import { drawLine } from 'utils/canvas/drawLine';
import { drawLineEndpointArrowheads } from './drawLineEndpointArrowheads';

export const drawLineLeafNode = (context: TDrawContext, node: TLineNode, dragOpacity: number): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  drawLine(
    gl,
    program,
    buffer,
    node,
    node.stroke,
    node.strokeWidth ?? LINE_RENDER_STROKE_WIDTH,
    canvasWidth,
    canvasHeight,
    viewport,
    dragOpacity,
  );
  drawLineEndpointArrowheads(context, node);
};
