// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getPolygonVertexCountHandleAtPoint } from '../../../../../utils/getPolygonVertexCountHandleAtPoint';

export const resolvePolygonVertexHover = ({ point, resizableSelectedNodes, viewport }: THoverResolverContext): THoverResult | undefined => {
  const polygonVertexCountHandleHit = getPolygonVertexCountHandleAtPoint(point, resizableSelectedNodes, viewport);

  if (polygonVertexCountHandleHit) {
    return { className: 'vertices', cursor: '', nodeId: polygonVertexCountHandleHit.nodeId };
  }
};
