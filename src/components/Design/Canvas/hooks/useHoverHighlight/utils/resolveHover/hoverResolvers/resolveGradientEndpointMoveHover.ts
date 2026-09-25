// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getGradientEndpointMoveHandleAtPoint } from '../../../../../utils/getGradientEndpointMoveHandleAtPoint';
import { getHandleHoverResult } from '../getHandleHoverResult';

export const resolveGradientEndpointMoveHover = ({
  gradientEditor,
  point,
  refs,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getGradientEndpointMoveHandleAtPoint(point, selectedNodes, viewport, gradientEditor);
  setRef(refs.hover, 'hoveredGradientEndpointMoveRef', hit?.endpoint ?? null);

  return getHandleHoverResult(hit, 'positioning');
};
