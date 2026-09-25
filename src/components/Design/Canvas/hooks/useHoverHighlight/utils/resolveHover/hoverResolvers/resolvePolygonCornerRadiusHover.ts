// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getHandleHoverResult } from '../getHandleHoverResult';
import { getPolygonCornerRadiusHandleAtPoint } from '../../../../../utils/getPolygonCornerRadiusHandleAtPoint';

export const resolvePolygonCornerRadiusHover = ({
  point,
  refs,
  resizableSelectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getPolygonCornerRadiusHandleAtPoint(point, resizableSelectedNodes, viewport);
  setRef(refs.hover, 'hoveredPolygonCornerRadiusHandleRef', hit?.nodeId ?? null);

  return getHandleHoverResult(hit, 'radius');
};
