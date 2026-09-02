// types
import { TArmContext } from '../types';

// utils
import { armStarVertexCountDrag } from '../armStarVertexCountDrag';
import { getStarVertexCountHandleAtPoint } from '../../../../../utils/getStarVertexCountHandleAtPoint';

export const armStarVertexCountOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const starVertexCountHandleHit = getStarVertexCountHandleAtPoint(point, selectedNodes, viewport);

  if (starVertexCountHandleHit) {
    armStarVertexCountDrag(
      canvas,
      event,
      canvasRefs.vertexCount.starVertexCountDragRef,
      starVertexCountHandleHit.bounds,
      starVertexCountHandleHit.nodeId,
      starVertexCountHandleHit.rotation,
      starVertexCountHandleHit.flipX,
      starVertexCountHandleHit.flipY,
    );

    return true;
  }
};
