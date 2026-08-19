// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getRotateCursorAngle } from 'utils/math/getRotateCursorAngle';
import { getRotateHandleAtPoint } from '../../../../../utils/getRotateHandleAtPoint';
import { getRotatedRotateCursorUrl } from 'utils/canvas/getRotatedRotateCursorUrl';

export const resolveRotateHover = ({ point, resizableSelectedNodes, viewport }: THoverResolverContext): THoverResult | undefined => {
  const rotateHandleHit = getRotateHandleAtPoint(point, resizableSelectedNodes, viewport);

  if (rotateHandleHit) {
    const cursor = getRotatedRotateCursorUrl(getRotateCursorAngle(point, rotateHandleHit.bounds, rotateHandleHit.rotation)) ?? '';

    return { className: null, cursor, nodeId: null };
  }
};
