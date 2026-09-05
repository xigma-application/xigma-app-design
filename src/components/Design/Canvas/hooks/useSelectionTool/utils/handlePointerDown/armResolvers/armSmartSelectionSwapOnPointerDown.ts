// store
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armSmartSelectionSwapDrag } from '../armSmartSelectionSwapDrag';
import { getSmartSelectionSwapHandleAtPoint } from '../../../../../utils/getSmartSelectionSwapHandleAtPoint';
import { isNodeAutoLayoutChild } from 'utils/canvas/signals/isNodeAutoLayoutChild';

export const armSmartSelectionSwapOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  smartSelectionNodes,
  viewport,
}: TArmContext): true | undefined => {
  const nodesById = selectNodes(store.getState());
  const isAutoLayoutSelection = smartSelectionNodes.some((node) => isNodeAutoLayoutChild(node, nodesById));
  const hit = isAutoLayoutSelection ? null : getSmartSelectionSwapHandleAtPoint(point, smartSelectionNodes, viewport);

  if (hit) {
    armSmartSelectionSwapDrag(canvas, event, canvasRefs.smartSelection.swapDragRef, hit.layout, hit.index, point);
    return true;
  }
};
