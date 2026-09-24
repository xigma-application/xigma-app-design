// others
import {
  SMART_SELECTION_GAP_HANDLE_STROKE,
  SMART_SELECTION_SWAP_HANDLE_CORE_SIZE_PX,
  SMART_SELECTION_SWAP_HANDLE_FILL,
  SMART_SELECTION_SWAP_HANDLE_OUTLINE_SIZE_PX,
} from 'constant/canvas';
import { DOT_CIRCLE_SEGMENTS, SCREEN_CELL_STRIDE } from './constants';

// types
import { TRectBatch } from 'utils/canvas/drawRectBatch/types';
import { TSmartSelectionLayout } from 'types/design/smartSelection/types';

// utils
import { getSmartSelectionLayoutNodes } from '../getSmartSelectionLayoutNodes';
import { getSolidFillColor } from 'utils/canvas/drawRectBatch/getSolidFillColor';
import { pushFilledCircle } from 'utils/canvas/drawRectBatch/pushFilledCircle';

export const pushSwapHandleDots = (batch: TRectBatch, layout: TSmartSelectionLayout, zoom: number): void => {
  const outlineRadius = SMART_SELECTION_SWAP_HANDLE_OUTLINE_SIZE_PX / zoom / 2;
  const coreRadius = SMART_SELECTION_SWAP_HANDLE_CORE_SIZE_PX / zoom / 2;
  const outlineColor = getSolidFillColor(SMART_SELECTION_GAP_HANDLE_STROKE);
  const coreColor = getSolidFillColor(SMART_SELECTION_SWAP_HANDLE_FILL);
  const drawnCells = new Set<number>();

  getSmartSelectionLayoutNodes(layout).forEach(({ bounds }) => {
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const cell = Math.round(centerX * zoom) * SCREEN_CELL_STRIDE + Math.round(centerY * zoom);

    if (!drawnCells.has(cell)) {
      drawnCells.add(cell);
      pushFilledCircle(batch, centerX, centerY, outlineRadius, outlineColor, 1, DOT_CIRCLE_SEGMENTS);
      pushFilledCircle(batch, centerX, centerY, coreRadius, coreColor, 1, DOT_CIRCLE_SEGMENTS);
    }
  });
};
