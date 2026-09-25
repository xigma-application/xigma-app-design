// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getGradientAddStopPositionAtPoint } from '../../../../../utils/getGradientAddStopPositionAtPoint';
import { getHandleHoverResult } from '../getHandleHoverResult';

export const resolveGradientLineHover = ({
  gradientEditor,
  point,
  refs,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getGradientAddStopPositionAtPoint(point, selectedNodes, viewport, gradientEditor);
  setRef(refs.hover, 'hoveredGradientLinePositionRef', hit?.position ?? null);

  return getHandleHoverResult(hit, 'drawing');
};
