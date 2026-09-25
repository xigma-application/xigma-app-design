// others
import { SECTION_STROKE, SECTION_STROKE_OPACITY, SECTION_STROKE_WIDTH_PX } from 'constant/canvas';

// types
import { StrokeAlign } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TDrawContext } from '../types';

// utils
import { drawThickOutline } from 'utils/canvas/drawThickOutline/drawThickOutline';

export const drawSectionStroke = (
  context: TDrawContext,
  rect: TDraftRect & { cornerRadius?: number },
  rotation: number,
  opacity: number,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  drawThickOutline(
    gl,
    program,
    buffer,
    rect,
    SECTION_STROKE,
    SECTION_STROKE_WIDTH_PX,
    canvasWidth,
    canvasHeight,
    viewport,
    rotation,
    StrokeAlign.inside,
    SECTION_STROKE_OPACITY * opacity,
  );
};
