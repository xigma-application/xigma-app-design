// others
import {
  SMART_SELECTION_SUGGESTION_ICON_BAR_FILL,
  SMART_SELECTION_SUGGESTION_ICON_BAR_GAP_PX,
  SMART_SELECTION_SUGGESTION_ICON_BAR_LENGTH_PX,
  SMART_SELECTION_SUGGESTION_ICON_BAR_THICKNESS_PX,
} from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';

const BAR_COUNT = 3;

export const drawSmartSelectionSuggestionColumnGlyph = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  rect: TDraftRect,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const barLength = SMART_SELECTION_SUGGESTION_ICON_BAR_LENGTH_PX / viewport.zoom;
  const barThickness = SMART_SELECTION_SUGGESTION_ICON_BAR_THICKNESS_PX / viewport.zoom;
  const barGap = SMART_SELECTION_SUGGESTION_ICON_BAR_GAP_PX / viewport.zoom;
  const totalWidth = barThickness * BAR_COUNT + barGap * (BAR_COUNT - 1);
  const startX = rect.x + rect.width / 2 - totalWidth / 2;
  const barY = rect.y + rect.height / 2 - barLength / 2;

  for (let index = 0; index < BAR_COUNT; index += 1) {
    const barX = startX + index * (barThickness + barGap);

    drawRect(
      gl,
      program,
      buffer,
      { fill: SMART_SELECTION_SUGGESTION_ICON_BAR_FILL, height: barLength, width: barThickness, x: barX, y: barY },
      canvasWidth,
      canvasHeight,
      viewport,
      0,
    );
  }
};
