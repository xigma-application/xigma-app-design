// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getHandleHoverResult } from '../getHandleHoverResult';
import { getProgressiveBlurHandleAtPoint } from '../../../../../utils/getProgressiveBlurHandleAtPoint';

export const resolveProgressiveBlurHover = ({
  openPropertyPanel,
  point,
  refs,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getProgressiveBlurHandleAtPoint(point, selectedNodes, viewport, openPropertyPanel);
  setRef(refs.progressiveBlur, 'hoveredEndpointRef', hit?.endpoint ?? null);

  return getHandleHoverResult(hit, 'positioning');
};
