// store
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

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
  const nodesById = selectNodes(store.getState());
  const hit = getSmartSelectionSwapHandleAtPoint(point, smartSelectionNodes, viewport, nodesById);

  if (hit) {
    armSmartSelectionSwapDrag(canvas, event, canvasRefs.smartSelection.swapDragRef, hit.layout, hit.index, point);
    return true;
  }
};
