// types
import { TArmContext } from '../types';

// utils
import { armStarCornerRadiusDrag } from '../armStarCornerRadiusDrag';
import { getStarCornerRadiusHandleAtPoint } from '../../../../../utils/getStarCornerRadiusHandleAtPoint';

export const armStarCornerRadiusOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const starCornerRadiusHandleHit = getStarCornerRadiusHandleAtPoint(point, selectedNodes, viewport);

  if (starCornerRadiusHandleHit) {
    armStarCornerRadiusDrag(
      canvas,
      event,
      canvasRefs.starCornerRadiusDragRef,
      starCornerRadiusHandleHit.bounds,
      starCornerRadiusHandleHit.nodeId,
      starCornerRadiusHandleHit.rotation,
      starCornerRadiusHandleHit.points,
      starCornerRadiusHandleHit.ratio,
      starCornerRadiusHandleHit.flipX,
      starCornerRadiusHandleHit.flipY,
    );

    return true;
  }
};
