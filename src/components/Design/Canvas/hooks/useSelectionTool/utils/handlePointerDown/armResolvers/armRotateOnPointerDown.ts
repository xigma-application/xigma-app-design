// types
import { TArmContext } from '../types';

// utils
import { armRotateDrag } from '../armRotateDrag';
import { getRotateHandleAtPoint } from '../../../../../utils/getRotateHandleAtPoint';

export const armRotateOnPointerDown = ({ canvas, event, point, selectedNodes, selectionRefs, viewport }: TArmContext): true | undefined => {
  const rotateHandleHit = getRotateHandleAtPoint(point, selectedNodes, viewport);

  if (rotateHandleHit) {
    armRotateDrag(canvas, event, selectionRefs.rotateDragRef, selectedNodes, rotateHandleHit.bounds, rotateHandleHit.rotation, point);

    return true;
  }
};
