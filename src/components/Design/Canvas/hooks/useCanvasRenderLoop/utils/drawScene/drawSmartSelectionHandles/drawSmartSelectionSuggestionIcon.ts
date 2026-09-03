// others
import { SMART_SELECTION_SUGGESTION_ICON_CORNER_RADIUS_PX, SMART_SELECTION_SUGGESTION_ICON_FILL } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { drawSmartSelectionSuggestionColumnGlyph } from './drawSmartSelectionSuggestionColumnGlyph';
import { drawSmartSelectionSuggestionRowGlyph } from './drawSmartSelectionSuggestionRowGlyph';

export const drawSmartSelectionSuggestionIcon = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  rect: TDraftRect,
  axis: 'x' | 'y',
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawRect(
    gl,
    program,
    buffer,
    { ...rect, cornerRadius: SMART_SELECTION_SUGGESTION_ICON_CORNER_RADIUS_PX / viewport.zoom, fill: SMART_SELECTION_SUGGESTION_ICON_FILL },
    canvasWidth,
    canvasHeight,
    viewport,
    0,
  );

  if (axis === 'x') {
    drawSmartSelectionSuggestionRowGlyph(gl, program, buffer, rect, canvasWidth, canvasHeight, viewport);
  } else {
    drawSmartSelectionSuggestionColumnGlyph(gl, program, buffer, rect, canvasWidth, canvasHeight, viewport);
  }
};
