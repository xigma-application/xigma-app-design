// types
import { TArmContext } from '../types';

// utils
import { armPolygonVertexCountDrag } from '../armPolygonVertexCountDrag';
import { getPolygonVertexCountHandleAtPoint } from '../../../../../utils/getPolygonVertexCountHandleAtPoint';

export const armPolygonVertexCountOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const polygonVertexCountHandleHit = getPolygonVertexCountHandleAtPoint(point, selectedNodes, viewport);

  if (polygonVertexCountHandleHit) {
    armPolygonVertexCountDrag(
      canvas,
      event,
      canvasRefs.vertexCount.polygonVertexCountDragRef,
      polygonVertexCountHandleHit.bounds,
      polygonVertexCountHandleHit.nodeId,
      polygonVertexCountHandleHit.rotation,
      polygonVertexCountHandleHit.flipX,
      polygonVertexCountHandleHit.flipY,
    );

    return true;
  }
};
