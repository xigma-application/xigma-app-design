// types
import { TArmContext } from '../types';

// utils
import { armGroupBoundsDrag } from '../armGroupBoundsDrag';
import { isPointInSelectedTextBounds } from '../../isPointInSelectedTextBounds';

export const armSelectedTextBoundsOnPointerDown = ({
  canvas,
  canvasRefs,
  currentSelection,
  event,
  point,
  selectedNodes,
  selectionRefs,
}: TArmContext): true | undefined => {
  if (!event.shiftKey && isPointInSelectedTextBounds(point, selectedNodes)) {
    armGroupBoundsDrag(canvas, event, selectionRefs.dragStateRef, currentSelection, point, canvasRefs);
    return true;
  }
};
