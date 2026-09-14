// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getGradientRadiusHandleAtPoint } from '../../../../../utils/getGradientRadiusHandleAtPoint';

export const resolveGradientRadiusHover = ({
  gradientEditor,
  point,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const radiusHit = getGradientRadiusHandleAtPoint(point, selectedNodes, viewport, gradientEditor);

  if (radiusHit) {
    return { className: 'positioning', cursor: '', nodeId: radiusHit.nodeId };
  }
};
