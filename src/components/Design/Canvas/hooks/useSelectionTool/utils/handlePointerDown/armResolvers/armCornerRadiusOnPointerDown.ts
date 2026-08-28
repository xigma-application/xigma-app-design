// types
import { TArmContext } from '../types';

// utils
import { armCornerRadiusDrag } from '../armCornerRadiusDrag';
import { getCornerRadiusHandleAtPoint } from '../../../../../utils/getCornerRadiusHandleAtPoint';

export const armCornerRadiusOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const cornerRadiusHandleHit = getCornerRadiusHandleAtPoint(point, selectedNodes, viewport);

  if (cornerRadiusHandleHit) {
    armCornerRadiusDrag(
      canvas,
      event,
      canvasRefs.cornerRadius.cornerRadiusDragRef,
      cornerRadiusHandleHit.bounds,
      cornerRadiusHandleHit.corners,
      cornerRadiusHandleHit.nodeId,
      cornerRadiusHandleHit.rotation,
      point,
    );

    return true;
  }
};
