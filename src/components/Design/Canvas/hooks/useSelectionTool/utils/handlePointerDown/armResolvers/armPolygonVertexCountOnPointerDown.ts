// types
import { TArmContext } from '../types';

// utils
import { armPolygonVertexCountDrag } from '../armPolygonVertexCountDrag';
import { getPolygonVertexCountHandleAtPoint } from '../../../../../utils/getPolygonVertexCountHandleAtPoint';

export const armPolygonVertexCountOnPointerDown = ({
  canvas,
  event,
  point,
  selectedNodes,
  selectionRefs,
  viewport,
}: TArmContext): true | undefined => {
  const polygonVertexCountHandleHit = getPolygonVertexCountHandleAtPoint(point, selectedNodes, viewport);

  if (polygonVertexCountHandleHit) {
    armPolygonVertexCountDrag(
      canvas,
      event,
      selectionRefs.polygonVertexCountDragRef,
      polygonVertexCountHandleHit.bounds,
      polygonVertexCountHandleHit.nodeId,
      polygonVertexCountHandleHit.rotation,
      polygonVertexCountHandleHit.flipX,
      polygonVertexCountHandleHit.flipY,
    );

    return true;
  }
};
