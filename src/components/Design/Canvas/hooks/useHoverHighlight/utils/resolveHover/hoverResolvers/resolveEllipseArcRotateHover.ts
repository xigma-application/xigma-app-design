// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getEllipseArcRotateHandleAtPoint } from '../../../../../utils/getEllipseArcRotateHandleAtPoint';
import { getHandleHoverResult } from '../getHandleHoverResult';

export const resolveEllipseArcRotateHover = ({
  point,
  refs,
  resizableSelectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getEllipseArcRotateHandleAtPoint(point, resizableSelectedNodes, viewport);
  setRef(refs.hover, 'hoveredEllipseArcRotateHandleRef', hit?.nodeId ?? null);

  return getHandleHoverResult(hit, 'radius');
};
