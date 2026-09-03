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
  smartSelectionNodes,
  viewport,
}: TArmContext): true | undefined => {
  const hit = getSmartSelectionSwapHandleAtPoint(point, smartSelectionNodes, viewport);

  if (hit) {
    armSmartSelectionSwapDrag(canvas, event, canvasRefs.smartSelection.swapDragRef, hit.layout, hit.index, point);
    return true;
  }
};
