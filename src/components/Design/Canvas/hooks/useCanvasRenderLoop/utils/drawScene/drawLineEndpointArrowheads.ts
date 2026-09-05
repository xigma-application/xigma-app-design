// others
import { ARROWHEAD_LENGTH, ARROWHEAD_STROKE_WIDTH } from 'constant/canvas';

// types
import { TDraftLine } from 'types/design/types';
import { TDrawContext } from './types';

// utils
import { drawArrowhead } from 'utils/canvas/drawArrowhead';

export const drawLineEndpointArrowheads = (context: TDrawContext, line: TDraftLine): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  const length = Math.hypot(dx, dy);

  if (length !== 0) {
    const direction = { x: dx / length, y: dy / length };

    if (line.endPoint === 'arrow') {
      drawArrowhead(
        gl,
        program,
        buffer,
        { x: line.x2, y: line.y2 },
        direction,
        ARROWHEAD_LENGTH,
        ARROWHEAD_STROKE_WIDTH,
        line.stroke,
        canvasWidth,
        canvasHeight,
        viewport,
      );
    }

    if (line.startPoint === 'arrow') {
      drawArrowhead(
        gl,
        program,
        buffer,
        { x: line.x1, y: line.y1 },
        { x: -direction.x, y: -direction.y },
        ARROWHEAD_LENGTH,
        ARROWHEAD_STROKE_WIDTH,
        line.stroke,
        canvasWidth,
        canvasHeight,
        viewport,
      );
    }
  }
};
