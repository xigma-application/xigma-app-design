// others
import {
  FRAME_DROP_TARGET_STROKE,
  GRID_SLOT_ACTIVE_FILL,
  GRID_SLOT_ACTIVE_FILL_ALPHA,
  GRID_SLOT_ACTIVE_STROKE,
  GRID_SLOT_STROKE,
} from 'constant/canvas';

// store
import { getAutoLayoutFrameCenter } from 'store/design/utils/autoLayout/getAutoLayoutFrameCenter';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { getGridInsertIndicatorRect } from 'utils/canvas/gridSlots/getGridInsertIndicatorRect';
import { getGridSlotRect } from 'utils/canvas/gridSlots/getGridSlotRect';
import { getGridTrackLayout } from 'utils/canvas/gridSlots/getGridTrackLayout';

export const drawGridDropTarget = (context: TDrawSceneContext, refs: TCanvasRefs, nodesById: Record<string, TSceneNode>): void => {
  const hover = refs.transform.gridDropTargetRef.current;
  const frame = hover ? nodesById[hover.frameId] : null;

  if (hover && frame && frame.type === NodeType.frame) {
    const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
    const layout = getGridTrackLayout(frame, nodesById);
    const frameCenter = getAutoLayoutFrameCenter(frame);

    if (hover.indicator) {
      drawRect(
        gl,
        program,
        buffer,
        { ...getGridInsertIndicatorRect(layout, frame, hover.indicator), fill: FRAME_DROP_TARGET_STROKE },
        canvasWidth,
        canvasHeight,
        viewport,
        frame.rotation,
        frameCenter,
      );
    } else {
      const activeKeys = new Set((hover.previewCells ?? hover.cells).map((cell) => `${cell.row}:${cell.column}`));

      for (let row = 0; row < layout.rowCount; row += 1) {
        for (let column = 0; column < layout.columnCount; column += 1) {
          const isActive = activeKeys.has(`${row}:${column}`);
          const rect = getGridSlotRect(layout, frame, column, row);

          drawRect(
            gl,
            program,
            buffer,
            {
              ...rect,
              fill: isActive ? GRID_SLOT_ACTIVE_FILL : undefined,
              fillAlpha: isActive ? GRID_SLOT_ACTIVE_FILL_ALPHA : undefined,
              stroke: isActive ? GRID_SLOT_ACTIVE_STROKE : GRID_SLOT_STROKE,
            },
            canvasWidth,
            canvasHeight,
            viewport,
            frame.rotation,
            frameCenter,
          );
        }
      }
    }
  }
};
