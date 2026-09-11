// constant
import { GRID_SLOT_ACTIVE_FILL, GRID_SLOT_ACTIVE_FILL_ALPHA, GRID_SLOT_ACTIVE_STROKE } from 'constant/canvas';

// types
import { TDrawSceneContext } from '../types';
import { TFrameNode } from 'types/design/types';
import { TGridTrackAffordanceDragState } from 'types/design/canvas/types';
import { TGridTrackLayout } from 'utils/canvas/gridSlots/getGridTrackLayout';
import { TPoint } from 'types/canvas';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { getGridTrackOffset } from 'utils/canvas/gridSlots/getGridTrackOffset';

export const drawGridTrackAffordanceGhost = (
  context: TDrawSceneContext,
  frame: TFrameNode,
  layout: TGridTrackLayout,
  dragState: TGridTrackAffordanceDragState | null,
  frameCenter: TPoint,
): void => {
  if (dragState && dragState.hasMoved) {
    const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
    const isColumn = dragState.axis === 'column';
    const sizes = isColumn ? layout.columnSizes : layout.rowSizes;
    const gap = isColumn ? layout.columnGap : layout.rowGap;
    const minIndex = Math.min(...dragState.sourceIndices);
    const maxIndex = Math.max(...dragState.sourceIndices);
    const spanStart = getGridTrackOffset(sizes, gap, minIndex);
    const spanSize = getGridTrackOffset(sizes, gap, maxIndex) + (sizes[maxIndex] ?? 0) - spanStart;
    const rect = isColumn
      ? { height: frame.height, width: spanSize, x: dragState.ghostPosition.x - spanSize / 2, y: frame.y }
      : { height: spanSize, width: frame.width, x: frame.x, y: dragState.ghostPosition.y - spanSize / 2 };

    drawRect(
      gl,
      program,
      buffer,
      { ...rect, fill: GRID_SLOT_ACTIVE_FILL, fillAlpha: GRID_SLOT_ACTIVE_FILL_ALPHA, stroke: GRID_SLOT_ACTIVE_STROKE },
      canvasWidth,
      canvasHeight,
      viewport,
      frame.rotation,
      frameCenter,
    );
  }
};
