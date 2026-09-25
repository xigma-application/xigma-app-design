// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getCornerRadiusHandleAtPoint } from '../../../../../utils/getCornerRadiusHandleAtPoint';
import { getHandleHoverResult } from '../getHandleHoverResult';

export const resolveCornerRadiusHover = ({
  point,
  refs,
  resizableSelectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getCornerRadiusHandleAtPoint(point, resizableSelectedNodes, viewport);
  setRef(refs.hover, 'hoveredCornerRadiusHandleRef', hit ? { corner: hit.corners[0], nodeId: hit.nodeId } : null);

  return getHandleHoverResult(hit, 'radius');
};
