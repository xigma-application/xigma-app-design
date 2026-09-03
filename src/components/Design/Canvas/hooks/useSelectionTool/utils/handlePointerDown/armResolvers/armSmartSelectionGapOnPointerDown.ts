// types
import { TArmContext } from '../types';

// utils
import { armSmartSelectionGapDrag } from '../armSmartSelectionGapDrag';
import { getSmartSelectionGapHandleAtPoint } from '../../../../../utils/getSmartSelectionGapHandleAtPoint';

export const armSmartSelectionGapOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const hit = getSmartSelectionGapHandleAtPoint(point, selectedNodes, viewport);

  if (hit) {
    armSmartSelectionGapDrag(canvas, event, canvasRefs.smartSelection.gapDragRef, hit.layout, hit.axis, hit.gapValue, hit.midpoint, point);

    return true;
  }
};
