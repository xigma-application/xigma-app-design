// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getHandleHoverResult } from '../getHandleHoverResult';
import { getStarRatioHandleAtPoint } from '../../../../../utils/getStarRatioHandleAtPoint';

export const resolveStarRatioHover = ({
  point,
  refs,
  resizableSelectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getStarRatioHandleAtPoint(point, resizableSelectedNodes, viewport);
  setRef(refs.hover, 'hoveredStarRatioHandleRef', hit?.nodeId ?? null);

  return getHandleHoverResult(hit, 'ratio');
};
