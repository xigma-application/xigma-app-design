// types
import { TArmContext } from '../types';

// utils
import { armPolygonCornerRadiusDrag } from '../armPolygonCornerRadiusDrag';
import { getPolygonCornerRadiusHandleAtPoint } from '../../../../../utils/getPolygonCornerRadiusHandleAtPoint';

export const armPolygonCornerRadiusOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const polygonCornerRadiusHandleHit = getPolygonCornerRadiusHandleAtPoint(point, selectedNodes, viewport);

  if (polygonCornerRadiusHandleHit) {
    armPolygonCornerRadiusDrag(
      canvas,
      event,
      canvasRefs.cornerRadius.polygonCornerRadiusDragRef,
      polygonCornerRadiusHandleHit.bounds,
      polygonCornerRadiusHandleHit.nodeId,
      polygonCornerRadiusHandleHit.rotation,
      polygonCornerRadiusHandleHit.sides,
      polygonCornerRadiusHandleHit.flipX,
      polygonCornerRadiusHandleHit.flipY,
    );

    return true;
  }
};
