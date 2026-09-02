// types
import { TArmContext } from '../types';

// utils
import { armStarRatioDrag } from '../armStarRatioDrag';
import { getStarRatioHandleAtPoint } from '../../../../../utils/getStarRatioHandleAtPoint';

export const armStarRatioOnPointerDown = ({ canvas, canvasRefs, event, point, selectedNodes, viewport }: TArmContext): true | undefined => {
  const starRatioHandleHit = getStarRatioHandleAtPoint(point, selectedNodes, viewport);

  if (starRatioHandleHit) {
    armStarRatioDrag(
      canvas,
      event,
      canvasRefs.starRatio.starRatioDragRef,
      starRatioHandleHit.bounds,
      starRatioHandleHit.nodeId,
      starRatioHandleHit.rotation,
      starRatioHandleHit.points,
      starRatioHandleHit.flipX,
      starRatioHandleHit.flipY,
    );

    return true;
  }
};
