// others
import { SMART_SELECTION_SUGGESTION_ICON_CORNER_RADIUS_PX, SMART_SELECTION_SUGGESTION_ICON_FILL } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { drawSmartSelectionSuggestionColumnGlyph } from './drawSmartSelectionSuggestionColumnGlyph';
import { drawSmartSelectionSuggestionGridGlyph } from './drawSmartSelectionSuggestionGridGlyph';
import { drawSmartSelectionSuggestionRowGlyph } from './drawSmartSelectionSuggestionRowGlyph';

const GLYPH_DRAWERS = {
  column: drawSmartSelectionSuggestionRowGlyph,
  grid: drawSmartSelectionSuggestionGridGlyph,
  row: drawSmartSelectionSuggestionColumnGlyph,
};

export const drawSmartSelectionSuggestionIcon = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  rect: TDraftRect,
  kind: 'column' | 'grid' | 'row',
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

  GLYPH_DRAWERS[kind](gl, program, buffer, rect, canvasWidth, canvasHeight, viewport);
};
