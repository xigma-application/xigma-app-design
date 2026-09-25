// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getHandleHoverResult } from '../getHandleHoverResult';
import { getStarCornerRadiusHandleAtPoint } from '../../../../../utils/getStarCornerRadiusHandleAtPoint';

export const resolveStarCornerRadiusHover = ({
  point,
  refs,
  resizableSelectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getStarCornerRadiusHandleAtPoint(point, resizableSelectedNodes, viewport);
  setRef(refs.hover, 'hoveredStarCornerRadiusHandleRef', hit?.nodeId ?? null);

  return getHandleHoverResult(hit, 'radius');
};
