// types
import { TArmContext } from '../types';

// utils
import { armEllipseArcRatioDrag } from '../armEllipseArcRatioDrag';
import { getEllipseArcRatioHandleAtPoint } from '../../../../../utils/getEllipseArcRatioHandleAtPoint';

export const armEllipseArcRatioOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const ellipseArcRatioHandleHit = getEllipseArcRatioHandleAtPoint(point, selectedNodes, viewport);

  if (ellipseArcRatioHandleHit) {
    armEllipseArcRatioDrag(
      canvas,
      event,
      canvasRefs.ellipseArc.ellipseArcRatioDragRef,
      ellipseArcRatioHandleHit.bounds,
      ellipseArcRatioHandleHit.nodeId,
      ellipseArcRatioHandleHit.rotation,
      ellipseArcRatioHandleHit.flipX,
      ellipseArcRatioHandleHit.flipY,
    );

    return true;
  }
};
