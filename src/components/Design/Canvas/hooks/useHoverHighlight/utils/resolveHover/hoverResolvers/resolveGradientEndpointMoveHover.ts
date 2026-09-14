// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getGradientEndpointMoveHandleAtPoint } from '../../../../../utils/getGradientEndpointMoveHandleAtPoint';

export const resolveGradientEndpointMoveHover = ({
  gradientEditor,
  point,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const moveHit = getGradientEndpointMoveHandleAtPoint(point, selectedNodes, viewport, gradientEditor);

  if (moveHit) {
    return { className: 'positioning', cursor: '', nodeId: moveHit.nodeId };
  }
};
