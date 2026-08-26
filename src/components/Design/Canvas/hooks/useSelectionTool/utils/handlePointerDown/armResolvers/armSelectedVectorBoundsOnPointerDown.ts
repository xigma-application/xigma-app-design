// types
import { TArmContext } from '../types';

// utils
import { armGroupBoundsDrag } from '../armGroupBoundsDrag';
import { isPointInSelectedVectorBounds } from '../../isPointInSelectedVectorBounds';

export const armSelectedVectorBoundsOnPointerDown = ({
  canvas,
  canvasRefs,
  currentSelection,
  event,
  point,
  selectedNodes,
  selectionRefs,
}: TArmContext): true | undefined => {
  if (!event.shiftKey && isPointInSelectedVectorBounds(point, selectedNodes)) {
    armGroupBoundsDrag(canvas, event, selectionRefs.dragStateRef, currentSelection, point, canvasRefs);
    return true;
  }
};
