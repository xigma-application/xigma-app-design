// types
import { TArmContext } from '../types';

// utils
import { armHitDrag } from '../armHitDrag';
import { isPointInSelectedVectorBounds } from '../../isPointInSelectedVectorBounds';

export const armSelectedVectorBoundsOnPointerDown = ({
  canvas,
  currentSelection,
  dispatch,
  event,
  point,
  selectedNodes,
  selectionRefs,
}: TArmContext): true | undefined => {
  if (!event.shiftKey && isPointInSelectedVectorBounds(point, selectedNodes)) {
    armHitDrag(canvas, event, dispatch, selectionRefs.dragStateRef, selectedNodes[0], currentSelection, selectedNodes, point);
    return true;
  }
};
