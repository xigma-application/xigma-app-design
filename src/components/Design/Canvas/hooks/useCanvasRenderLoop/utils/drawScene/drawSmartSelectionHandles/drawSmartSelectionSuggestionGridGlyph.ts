// others
import {
  SMART_SELECTION_SUGGESTION_ICON_GRID_DOT_FILL,
  SMART_SELECTION_SUGGESTION_ICON_GRID_DOT_GAP_PX,
  SMART_SELECTION_SUGGESTION_ICON_GRID_DOT_SIZE_PX,
} from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';

const GRID_SIZE = 3;

export const drawSmartSelectionSuggestionGridGlyph = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  rect: TDraftRect,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const dotSize = SMART_SELECTION_SUGGESTION_ICON_GRID_DOT_SIZE_PX / viewport.zoom;
  const dotGap = SMART_SELECTION_SUGGESTION_ICON_GRID_DOT_GAP_PX / viewport.zoom;
  const total = dotSize * GRID_SIZE + dotGap * (GRID_SIZE - 1);
  const startX = rect.x + rect.width / 2 - total / 2;
  const startY = rect.y + rect.height / 2 - total / 2;

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let column = 0; column < GRID_SIZE; column += 1) {
      const x = startX + column * (dotSize + dotGap);
      const y = startY + row * (dotSize + dotGap);

      drawRect(
        gl,
        program,
        buffer,
        { fill: SMART_SELECTION_SUGGESTION_ICON_GRID_DOT_FILL, height: dotSize, width: dotSize, x, y },
        canvasWidth,
        canvasHeight,
        viewport,
        0,
      );
    }
  }
};
