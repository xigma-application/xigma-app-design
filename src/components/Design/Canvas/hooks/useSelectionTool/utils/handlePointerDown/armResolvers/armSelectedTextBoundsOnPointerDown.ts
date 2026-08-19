// types
import { TArmContext } from '../types';

// utils
import { armHitDrag } from '../armHitDrag';
import { isPointInSelectedTextBounds } from '../../isPointInSelectedTextBounds';

export const armSelectedTextBoundsOnPointerDown = ({
  canvas,
  currentSelection,
  dispatch,
  event,
  point,
  selectedNodes,
  selectionRefs,
}: TArmContext): true | undefined => {
  if (!event.shiftKey && isPointInSelectedTextBounds(point, selectedNodes)) {
    armHitDrag(canvas, event, dispatch, selectionRefs.dragStateRef, selectedNodes[0], currentSelection, selectedNodes, point);

    return true;
  }
};
