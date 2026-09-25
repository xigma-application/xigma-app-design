// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getEllipseArcHandleAtPoint } from '../../../../../utils/getEllipseArcHandleAtPoint';
import { getHandleHoverResult } from '../getHandleHoverResult';

export const resolveEllipseArcHover = ({
  point,
  refs,
  resizableSelectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getEllipseArcHandleAtPoint(point, resizableSelectedNodes, viewport);
  setRef(refs.hover, 'hoveredEllipseArcHandleRef', hit?.nodeId ?? null);

  return getHandleHoverResult(hit, 'radius');
};
