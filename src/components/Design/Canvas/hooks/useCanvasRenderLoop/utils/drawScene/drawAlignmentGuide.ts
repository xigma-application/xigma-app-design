// others
import { ALIGNMENT_GUIDE_STROKE } from 'constant/canvas';

// types
import { TAlignmentGuide } from '../../../../utils/getGroupAlignmentGuide';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from 'utils/canvas/drawLine';

export const drawAlignmentGuide = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  guide: TAlignmentGuide | null,
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
      ALIGNMENT_GUIDE_STROKE,
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
      ALIGNMENT_GUIDE_STROKE,
      1 / viewport.zoom,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
