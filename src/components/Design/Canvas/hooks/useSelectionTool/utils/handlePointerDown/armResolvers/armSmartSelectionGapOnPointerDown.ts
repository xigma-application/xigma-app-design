// store
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armSmartSelectionGapDrag } from '../armSmartSelectionGapDrag';
import { getSmartSelectionGapHandleAtPoint } from '../../../../../utils/getSmartSelectionGapHandleAtPoint';
import { isNodeAutoLayoutChild } from 'utils/canvas/signals/isNodeAutoLayoutChild';

export const armSmartSelectionGapOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  smartSelectionNodes,
  viewport,
}: TArmContext): true | undefined => {
  const nodesById = selectNodes(store.getState());
  const isAutoLayoutSelection = smartSelectionNodes.some((node) => isNodeAutoLayoutChild(node, nodesById));
  const hit = isAutoLayoutSelection ? null : getSmartSelectionGapHandleAtPoint(point, smartSelectionNodes, viewport);

  if (hit) {
    armSmartSelectionGapDrag(canvas, event, canvasRefs.smartSelection.gapDragRef, hit.layout, hit.axis, hit.gapIndex, hit.gapValue, point);
    return true;
  }
};
