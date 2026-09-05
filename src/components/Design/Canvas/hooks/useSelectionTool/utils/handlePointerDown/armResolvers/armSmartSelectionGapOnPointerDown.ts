// store
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

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
  const nodesById = selectNodes(store.getState());
  const hit = getSmartSelectionGapHandleAtPoint(point, smartSelectionNodes, viewport, nodesById);

  if (hit) {
    armSmartSelectionGapDrag(canvas, event, canvasRefs.smartSelection.gapDragRef, hit.layout, hit.axis, hit.gapIndex, hit.gapValue, point);
    return true;
  }
};
