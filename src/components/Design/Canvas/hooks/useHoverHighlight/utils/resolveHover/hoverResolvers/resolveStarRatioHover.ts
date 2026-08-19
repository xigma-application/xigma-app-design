// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getStarRatioHandleAtPoint } from '../../../../../utils/getStarRatioHandleAtPoint';

export const resolveStarRatioHover = ({ point, resizableSelectedNodes, viewport }: THoverResolverContext): THoverResult | undefined => {
  const starRatioHandleHit = getStarRatioHandleAtPoint(point, resizableSelectedNodes, viewport);

  if (starRatioHandleHit) {
    return { className: 'ratio', cursor: '', nodeId: starRatioHandleHit.nodeId };
  }
};
