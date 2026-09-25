// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getHandleHoverResult } from '../getHandleHoverResult';
import { getPolygonVertexCountHandleAtPoint } from '../../../../../utils/getPolygonVertexCountHandleAtPoint';

export const resolvePolygonVertexHover = ({
  point,
  refs,
  resizableSelectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getPolygonVertexCountHandleAtPoint(point, resizableSelectedNodes, viewport);
  setRef(refs.hover, 'hoveredPolygonVertexCountHandleRef', hit?.nodeId ?? null);

  return getHandleHoverResult(hit, 'vertices');
};
