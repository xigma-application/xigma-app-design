// constant
import { GRID_TRACK_AFFORDANCE_BORDER_WIDTH_PX, GRID_TRACK_AFFORDANCE_HANDLE_HOVER_FILL } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TFrameNode } from 'types/design/types';
import { TGridTrackLayout } from 'utils/canvas/gridSlots/getGridTrackLayout';
import { TPoint } from 'types/canvas';

// utils
import { drawRotatedLine } from 'utils/canvas/drawRotatedLine';
import { getGridTrackOffset } from 'utils/canvas/gridSlots/getGridTrackOffset';

export const drawGridTrackAffordanceDropIndicator = (
  context: TDrawSceneContext,
  frame: TFrameNode,
  layout: TGridTrackLayout,
  dragState: TCanvasRefs['transform']['gridTrackAffordanceDragRef']['current'],
  frameCenter: TPoint,
): void => {
  if (dragState && dragState.frameId === frame.id && dragState.hasMoved) {
    const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
    const isColumn = dragState.axis === 'column';
    const sizes = isColumn ? layout.columnSizes : layout.rowSizes;
    const gap = isColumn ? layout.columnGap : layout.rowGap;
    const padding = isColumn ? layout.padding.paddingLeft : layout.padding.paddingTop;
    const strokeWidth = GRID_TRACK_AFFORDANCE_BORDER_WIDTH_PX / viewport.zoom;
    const offset = padding + getGridTrackOffset(sizes, gap, dragState.dropIndex);
    const line = isColumn
      ? { x1: frame.x + offset, x2: frame.x + offset, y1: frame.y, y2: frame.y + frame.height }
      : { x1: frame.x, x2: frame.x + frame.width, y1: frame.y + offset, y2: frame.y + offset };

    drawRotatedLine(
      gl,
      program,
      buffer,
      line,
      GRID_TRACK_AFFORDANCE_HANDLE_HOVER_FILL,
      strokeWidth,
      canvasWidth,
      canvasHeight,
      viewport,
      frame.rotation,
      frameCenter,
    );
  }
};
