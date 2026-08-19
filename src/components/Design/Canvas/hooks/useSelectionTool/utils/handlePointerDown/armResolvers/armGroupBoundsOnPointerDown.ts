// types
import { TArmContext } from '../types';

// utils
import { armGroupBoundsDrag } from '../armGroupBoundsDrag';
import { isPointInGroupBounds } from '../../isPointInGroupBounds';

export const armGroupBoundsOnPointerDown = ({
  canvas,
  currentSelection,
  event,
  point,
  selectedNodes,
  selectionRefs,
}: TArmContext): true | undefined => {
  if (!event.shiftKey && isPointInGroupBounds(point, selectedNodes)) {
    armGroupBoundsDrag(canvas, event, selectionRefs.dragStateRef, currentSelection, point);

    return true;
  }
};
