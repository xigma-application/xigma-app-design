// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getHandleHoverResult } from '../getHandleHoverResult';
import { getStarVertexCountHandleAtPoint } from '../../../../../utils/getStarVertexCountHandleAtPoint';

export const resolveStarVertexHover = ({
  point,
  refs,
  resizableSelectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getStarVertexCountHandleAtPoint(point, resizableSelectedNodes, viewport);
  setRef(refs.hover, 'hoveredStarVertexCountHandleRef', hit?.nodeId ?? null);

  return getHandleHoverResult(hit, 'vertices');
};
