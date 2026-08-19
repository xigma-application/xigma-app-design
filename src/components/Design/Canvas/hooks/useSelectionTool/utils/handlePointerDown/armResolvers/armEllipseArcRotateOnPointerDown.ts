// types
import { TArmContext } from '../types';

// utils
import { armEllipseArcRotateDrag } from '../armEllipseArcRotateDrag';
import { getEllipseArcRotateHandleAtPoint } from '../../../../../utils/getEllipseArcRotateHandleAtPoint';

export const armEllipseArcRotateOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const ellipseArcRotateHandleHit = getEllipseArcRotateHandleAtPoint(point, selectedNodes, viewport);

  if (ellipseArcRotateHandleHit) {
    armEllipseArcRotateDrag(
      canvas,
      event,
      canvasRefs.ellipseArcRotateDragRef,
      ellipseArcRotateHandleHit.bounds,
      ellipseArcRotateHandleHit.nodeId,
      ellipseArcRotateHandleHit.rotation,
      ellipseArcRotateHandleHit.flipX,
      ellipseArcRotateHandleHit.flipY,
    );

    return true;
  }
};
