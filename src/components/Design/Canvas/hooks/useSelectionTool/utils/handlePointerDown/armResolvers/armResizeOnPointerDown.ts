// types
import { TArmContext } from '../types';

// utils
import { armResizeDrag } from '../armResizeDrag';
import { getResizeHandleAtPoint } from '../../../../../utils/getResizeHandleAtPoint/getResizeHandleAtPoint';

export const armResizeOnPointerDown = ({ canvas, event, point, selectedNodes, selectionRefs, viewport }: TArmContext): true | undefined => {
  const resizeHandleHit = getResizeHandleAtPoint(point, selectedNodes, viewport);

  if (resizeHandleHit) {
    armResizeDrag(canvas, event, selectionRefs.resizeDragRef, selectedNodes, resizeHandleHit.handle, resizeHandleHit.bounds);

    return true;
  }
};
