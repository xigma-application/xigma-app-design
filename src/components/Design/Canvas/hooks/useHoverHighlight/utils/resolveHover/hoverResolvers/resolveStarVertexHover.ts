// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getStarVertexCountHandleAtPoint } from '../../../../../utils/getStarVertexCountHandleAtPoint';

export const resolveStarVertexHover = ({ point, resizableSelectedNodes, viewport }: THoverResolverContext): THoverResult | undefined => {
  const starVertexCountHandleHit = getStarVertexCountHandleAtPoint(point, resizableSelectedNodes, viewport);

  if (starVertexCountHandleHit) {
    return { className: 'vertices', cursor: '', nodeId: starVertexCountHandleHit.nodeId };
  }
};
