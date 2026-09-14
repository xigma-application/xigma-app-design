// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getGradientStopHandleAtPoint } from '../../../../../utils/getGradientStopHandleAtPoint';

export const resolveGradientStopHover = ({
  gradientEditor,
  point,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const gradientStopHit = getGradientStopHandleAtPoint(point, selectedNodes, viewport, gradientEditor);

  if (gradientStopHit) {
    return { className: 'positioning', cursor: '', nodeId: gradientStopHit.nodeId };
  }
};
