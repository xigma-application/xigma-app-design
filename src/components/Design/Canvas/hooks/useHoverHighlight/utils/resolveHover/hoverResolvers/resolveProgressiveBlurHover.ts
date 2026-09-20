// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getProgressiveBlurHandleAtPoint } from '../../../../../utils/getProgressiveBlurHandleAtPoint';

export const resolveProgressiveBlurHover = ({
  openPropertyPanel,
  point,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getProgressiveBlurHandleAtPoint(point, selectedNodes, viewport, openPropertyPanel);

  if (hit) {
    return { className: 'positioning', cursor: '', nodeId: hit.nodeId };
  }
};
