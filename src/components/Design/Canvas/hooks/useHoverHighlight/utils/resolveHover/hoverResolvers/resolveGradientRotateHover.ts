// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getGradientRotateHandleAtPoint } from '../../../../../utils/getGradientRotateHandleAtPoint';
import { getRotateCursorAngle } from 'utils/math/getRotateCursorAngle';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';

export const resolveGradientRotateHover = ({
  gradientEditor,
  point,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const rotateHit = getGradientRotateHandleAtPoint(point, selectedNodes, viewport, gradientEditor);

  if (rotateHit) {
    const cursor = getRotatedCursorUrl('rotate', getRotateCursorAngle(point, rotateHit.bounds, rotateHit.rotation)) ?? '';
    return { className: null, cursor, nodeId: rotateHit.nodeId };
  }
};
