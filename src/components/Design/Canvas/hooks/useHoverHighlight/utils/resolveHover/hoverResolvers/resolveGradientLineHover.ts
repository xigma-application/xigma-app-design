// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getGradientLinePositionAtPoint } from '../../../../../utils/getGradientLinePositionAtPoint';

export const resolveGradientLineHover = ({
  gradientEditor,
  point,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const gradientLineHit = getGradientLinePositionAtPoint(point, selectedNodes, viewport, gradientEditor);

  if (gradientLineHit) {
    return { className: 'drawing', cursor: '', nodeId: gradientLineHit.nodeId };
  }
};
