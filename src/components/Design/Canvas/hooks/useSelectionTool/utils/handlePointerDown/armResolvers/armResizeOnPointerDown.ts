// types
import { TArmContext } from '../types';

// utils
import { armResizeDrag } from '../armResizeDrag/armResizeDrag';
import { getResizeHandleAtPoint } from '../../../../../utils/getResizeHandleAtPoint/getResizeHandleAtPoint';

export const armResizeOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  selectionRefs,
  viewport,
}: TArmContext): true | undefined => {
  const resizeHandleHit = getResizeHandleAtPoint(point, selectedNodes, viewport);

  if (resizeHandleHit) {
    armResizeDrag(canvas, event, selectionRefs.resizeDragRef, selectedNodes, resizeHandleHit.handle, resizeHandleHit.bounds, canvasRefs);

    return true;
  }
};
