// others
import {
  ALIGNMENT_GUIDE_HALO_ALPHA,
  ALIGNMENT_GUIDE_HALO_STROKE,
  ALIGNMENT_GUIDE_HALO_WIDTH_PX,
  ALIGNMENT_GUIDE_STROKE,
  ALIGNMENT_GUIDE_STROKE_WIDTH_PX,
} from 'constant/canvas';

// types
import { TAlignmentAxisGuide, TAlignmentGuide } from '../../../../utils/getGroupAlignmentGuide';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from 'utils/canvas/drawLine';

const drawGuideAxisLine = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  axisGuide: TAlignmentAxisGuide,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const line = { x1: axisGuide.anchor.x, x2: axisGuide.match.x, y1: axisGuide.anchor.y, y2: axisGuide.match.y };

  drawLine(
    gl,
    program,
    buffer,
    line,
    ALIGNMENT_GUIDE_HALO_STROKE,
    ALIGNMENT_GUIDE_HALO_WIDTH_PX / viewport.zoom,
    canvasWidth,
    canvasHeight,
    viewport,
    ALIGNMENT_GUIDE_HALO_ALPHA,
  );
  drawLine(
    gl,
    program,
    buffer,
    line,
    ALIGNMENT_GUIDE_STROKE,
    ALIGNMENT_GUIDE_STROKE_WIDTH_PX / viewport.zoom,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};

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
    drawGuideAxisLine(gl, program, buffer, guide.vertical, canvasWidth, canvasHeight, viewport);
  }

  if (guide.horizontal) {
    drawGuideAxisLine(gl, program, buffer, guide.horizontal, canvasWidth, canvasHeight, viewport);
  }
};
