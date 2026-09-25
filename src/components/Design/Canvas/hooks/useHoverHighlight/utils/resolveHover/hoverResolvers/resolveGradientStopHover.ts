// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getGradientStopHandleAtPoint } from '../../../../../utils/getGradientStopHandleAtPoint';
import { getHandleHoverResult } from '../getHandleHoverResult';

export const resolveGradientStopHover = ({
  gradientEditor,
  point,
  refs,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getGradientStopHandleAtPoint(point, selectedNodes, viewport, gradientEditor);
  setRef(refs.hover, 'hoveredGradientStopIndexRef', hit?.stopIndex ?? null);

  return getHandleHoverResult(hit, 'positioning');
};
