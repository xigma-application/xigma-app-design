// others
import { VECTOR_ALIGNMENT_GUIDE_STROKE } from 'constant/canvas';

// types
import { TVectorAlignmentGuide } from '../../../../utils/applyVectorPointSnapping';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from 'utils/canvas/drawLine';

export const drawVectorAlignmentGuide = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  guide: TVectorAlignmentGuide | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (!guide) {
    return;
  }

  if (guide.vertical) {
    drawLine(
      gl,
      program,
      buffer,
      { x1: guide.vertical.anchor.x, x2: guide.vertical.match.x, y1: guide.vertical.anchor.y, y2: guide.vertical.match.y },
      VECTOR_ALIGNMENT_GUIDE_STROKE,
      1 / viewport.zoom,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }

  if (guide.horizontal) {
    drawLine(
      gl,
      program,
      buffer,
      { x1: guide.horizontal.anchor.x, x2: guide.horizontal.match.x, y1: guide.horizontal.anchor.y, y2: guide.horizontal.match.y },
      VECTOR_ALIGNMENT_GUIDE_STROKE,
      1 / viewport.zoom,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
