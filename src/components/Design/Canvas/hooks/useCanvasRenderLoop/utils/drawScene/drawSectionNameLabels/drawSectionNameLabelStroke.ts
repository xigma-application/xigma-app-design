// others
import { SECTION_STROKE_WIDTH_PX } from 'constant/canvas';

// types
import { StrokeAlign } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TDrawContext } from '../types';
import { TSectionNameLabelStyle } from 'utils/canvas/sectionNameLabel/types';

// utils
import { drawThickOutline } from 'utils/canvas/drawThickOutline/drawThickOutline';

export const drawSectionNameLabelStroke = (
  context: TDrawContext,
  rect: TDraftRect & { cornerRadius?: number },
  style: TSectionNameLabelStyle,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  if (style.stroke) {
    drawThickOutline(
      gl,
      program,
      buffer,
      rect,
      style.stroke,
      SECTION_STROKE_WIDTH_PX,
      canvasWidth,
      canvasHeight,
      viewport,
      0,
      StrokeAlign.inside,
      style.strokeOpacity,
    );
  }
};
