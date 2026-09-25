// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getGradientRadiusHandleAtPoint } from '../../../../../utils/getGradientRadiusHandleAtPoint';
import { getHandleHoverResult } from '../getHandleHoverResult';

export const resolveGradientRadiusHover = ({
  gradientEditor,
  point,
  refs,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getGradientRadiusHandleAtPoint(point, selectedNodes, viewport, gradientEditor);
  setRef(refs.hover, 'hoveredGradientRadiusHandleRef', hit?.nodeId ?? null);

  return getHandleHoverResult(hit, 'positioning');
};
