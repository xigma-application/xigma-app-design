// store
import { setSelection } from 'store/design/slice';

// types
import { TArmContext } from '../types';

// utils
import { armDrag } from '../armDrag/armDrag';
import { getGroupChildHitAtPoint } from '../getGroupChildHitAtPoint';
import { isControlPressed } from 'utils/isControlPressed';
import { toggleSelection } from '../../toggleSelection';

export const armGroupChildToggleOnPointerDown = ({
  canvas,
  canvasRefs,
  currentSelection,
  dispatch,
  event,
  point,
  selectionRefs,
  viewport,
}: TArmContext): true | undefined => {
  const childHit = isControlPressed(event) ? getGroupChildHitAtPoint(point, viewport) : null;

  if (childHit) {
    if (event.shiftKey) {
      dispatch(setSelection(toggleSelection(currentSelection, childHit.id)));
    } else {
      dispatch(setSelection([childHit.id]));
      armDrag([childHit.id], null, point, selectionRefs.dragStateRef, canvasRefs);
    }

    canvas.setPointerCapture(event.pointerId);

    return true;
  }
};
