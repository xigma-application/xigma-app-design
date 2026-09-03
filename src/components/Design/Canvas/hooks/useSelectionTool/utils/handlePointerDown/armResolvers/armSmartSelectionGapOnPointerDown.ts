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
  smartSelectionNodes,
  viewport,
}: TArmContext): true | undefined => {
  const hit = getSmartSelectionGapHandleAtPoint(point, smartSelectionNodes, viewport);

  if (hit) {
    armSmartSelectionGapDrag(canvas, event, canvasRefs.smartSelection.gapDragRef, hit.layout, hit.axis, hit.gapIndex, hit.gapValue, point);

    return true;
  }
};
