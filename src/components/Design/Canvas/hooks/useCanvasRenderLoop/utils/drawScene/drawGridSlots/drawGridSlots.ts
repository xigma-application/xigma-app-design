// others
import { GRID_SLOT_STROKE } from 'constant/canvas';

// store
import { getAutoLayoutFrameCenter } from 'store/design/utils/autoLayout/getAutoLayoutFrameCenter';
import { getSelectedGridFrame } from 'store/design/utils/autoLayout/getSelectedGridFrame';

// types
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { getGridSlotRects } from 'utils/canvas/gridSlots/getGridSlotRects';

export const drawGridSlots = (context: TDrawSceneContext, selectedNodes: TSceneNode[], nodesById: Record<string, TSceneNode>): void => {
  const frame = getSelectedGridFrame(selectedNodes);

  if (frame) {
    const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
    const frameCenter = getAutoLayoutFrameCenter(frame);

    getGridSlotRects(frame, nodesById).forEach((rect) => {
      drawRect(
        gl,
        program,
        buffer,
        { ...rect, stroke: GRID_SLOT_STROKE },
        canvasWidth,
        canvasHeight,
        viewport,
        frame.rotation,
        frameCenter,
      );
    });
  }
};
