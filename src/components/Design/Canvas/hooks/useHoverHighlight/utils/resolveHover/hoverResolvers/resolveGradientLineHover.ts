// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getGradientAddStopPositionAtPoint } from '../../../../../utils/getGradientAddStopPositionAtPoint';

export const resolveGradientLineHover = ({
  gradientEditor,
  point,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const gradientAddStopHit = getGradientAddStopPositionAtPoint(point, selectedNodes, viewport, gradientEditor);

  if (gradientAddStopHit) {
    return { className: 'drawing', cursor: '', nodeId: gradientAddStopHit.nodeId };
  }
};
