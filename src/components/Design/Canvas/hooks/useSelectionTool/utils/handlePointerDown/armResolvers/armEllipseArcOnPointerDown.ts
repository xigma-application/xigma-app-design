// types
import { TArmContext } from '../types';

// utils
import { armEllipseArcDrag } from '../armEllipseArcDrag';
import { getEllipseArcHandleAtPoint } from '../../../../../utils/getEllipseArcHandleAtPoint';

export const armEllipseArcOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const ellipseArcHandleHit = getEllipseArcHandleAtPoint(point, selectedNodes, viewport);

  if (ellipseArcHandleHit) {
    armEllipseArcDrag(
      canvas,
      event,
      canvasRefs.ellipseArcDragRef,
      ellipseArcHandleHit.bounds,
      ellipseArcHandleHit.nodeId,
      ellipseArcHandleHit.rotation,
      ellipseArcHandleHit.flipX,
      ellipseArcHandleHit.flipY,
    );

    return true;
  }
};
