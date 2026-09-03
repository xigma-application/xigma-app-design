// types
import { TArmContext } from '../types';

// utils
import { armSmartSelectionSwapDrag } from '../armSmartSelectionSwapDrag';
import { getSmartSelectionSwapHandleAtPoint } from '../../../../../utils/getSmartSelectionSwapHandleAtPoint';

export const armSmartSelectionSwapOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const hit = getSmartSelectionSwapHandleAtPoint(point, selectedNodes, viewport);

  if (hit) {
    armSmartSelectionSwapDrag(canvas, event, canvasRefs.smartSelection.swapDragRef, hit.layout, hit.index, point);
    return true;
  }
};
