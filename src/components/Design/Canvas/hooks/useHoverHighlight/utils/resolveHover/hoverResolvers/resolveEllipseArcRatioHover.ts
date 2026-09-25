// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getEllipseArcRatioHandleAtPoint } from '../../../../../utils/getEllipseArcRatioHandleAtPoint';
import { getHandleHoverResult } from '../getHandleHoverResult';

export const resolveEllipseArcRatioHover = ({
  point,
  refs,
  resizableSelectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getEllipseArcRatioHandleAtPoint(point, resizableSelectedNodes, viewport);
  setRef(refs.hover, 'hoveredEllipseArcRatioHandleRef', hit?.nodeId ?? null);

  return getHandleHoverResult(hit, 'radius');
};
