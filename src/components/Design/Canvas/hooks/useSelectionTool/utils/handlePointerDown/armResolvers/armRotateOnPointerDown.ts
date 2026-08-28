// types
import { TArmContext } from '../types';

// utils
import { armRotateDrag } from '../armRotateDrag';
import { getRotateHandleAtPoint } from '../../../../../utils/getRotateHandleAtPoint';

export const armRotateOnPointerDown = ({ canvas, canvasRefs, event, point, selectedNodes, viewport }: TArmContext): true | undefined => {
  const rotateHandleHit = getRotateHandleAtPoint(point, selectedNodes, viewport);

  if (rotateHandleHit) {
    armRotateDrag(
      canvas,
      event,
      canvasRefs.transform.rotateDragRef,
      selectedNodes,
      rotateHandleHit.bounds,
      rotateHandleHit.rotation,
      point,
      canvasRefs,
    );

    return true;
  }
};
