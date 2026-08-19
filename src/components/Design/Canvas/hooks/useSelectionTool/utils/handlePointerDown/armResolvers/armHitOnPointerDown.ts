// types
import { TArmContext } from '../types';

// utils
import { armHitDrag } from '../armHitDrag';

export const armHitOnPointerDown = ({
  canvas,
  currentSelection,
  dispatch,
  event,
  hit,
  point,
  selectedNodes,
  selectionRefs,
}: TArmContext): true | undefined => {
  if (hit) {
    armHitDrag(canvas, event, dispatch, selectionRefs.dragStateRef, hit, currentSelection, selectedNodes, point);

    return true;
  }
};
