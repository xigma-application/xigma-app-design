// others
import {
  GRID_SECTION_HIGHLIGHT_STROKE_WIDTH,
  GRID_SLOT_ACTIVE_FILL,
  GRID_SLOT_ACTIVE_FILL_ALPHA,
  GRID_SLOT_ACTIVE_STROKE,
} from 'constant/canvas';

// store
import { getAutoLayoutFrameCenter } from 'store/design/utils/autoLayout/getAutoLayoutFrameCenter';

// types
import { TCanvasRefs, TGridSectionHighlight, TGridTrackSelection } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { drawThickOutline } from 'utils/canvas/drawThickOutline/drawThickOutline';
import { getGridSectionHighlightCells } from 'utils/canvas/gridSlots/getGridSectionHighlightCells';
import { getGridSectionHighlightDragRects } from 'utils/canvas/gridSlots/getGridSectionHighlightDragRects';
import { isGridFrame } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerMove/continueDrag/updateDragDropTarget/isGridFrame';

export const drawGridSectionHighlight = (
  context: TDrawSceneContext,
  highlight: TGridSectionHighlight | null,
  gridTrackSelection: TGridTrackSelection | null,
  refs: TCanvasRefs,
  nodesById: Record<string, TSceneNode>,
): void => {
  const source = getGridSectionHighlightCells(nodesById, highlight, gridTrackSelection);
  const frame = source ? nodesById[source.frameId] : null;

  if (source && isGridFrame(frame)) {
    const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
    const frameCenter = getAutoLayoutFrameCenter(frame);
    const { cellRects, outlineRect } = getGridSectionHighlightDragRects(
      frame,
      nodesById,
      source.cells,
      refs.transform.gridTrackAffordanceDragRef.current,
    );

    cellRects.forEach((rect) => {
      drawRect(
        gl,
        program,
        buffer,
        { ...rect, fill: GRID_SLOT_ACTIVE_FILL, fillAlpha: GRID_SLOT_ACTIVE_FILL_ALPHA },
        canvasWidth,
        canvasHeight,
        viewport,
        frame.rotation,
        frameCenter,
      );
    });

    if (outlineRect) {
      drawThickOutline(
        gl,
        program,
        buffer,
        outlineRect,
        GRID_SLOT_ACTIVE_STROKE,
        GRID_SECTION_HIGHLIGHT_STROKE_WIDTH,
        canvasWidth,
        canvasHeight,
        viewport,
        frame.rotation,
        undefined,
        frameCenter,
      );
    }
  }
};
