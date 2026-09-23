// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getRotateCursorAngle } from 'utils/math/getRotateCursorAngle';
import { getRotateHandleAtPoint } from '../../../../../utils/getRotateHandleAtPoint';
import { getSelectionGroupHit } from '../../../../../utils/getSelectionGroupHit';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';

export const resolveRotateHover = ({ point, resizableSelectedNodes, viewport }: THoverResolverContext): THoverResult | undefined => {
  const rotateHandleHit = getSelectionGroupHit(resizableSelectedNodes, (group) => getRotateHandleAtPoint(point, group, viewport));

  if (rotateHandleHit) {
    const cursor = getRotatedCursorUrl('rotate', getRotateCursorAngle(point, rotateHandleHit.bounds, rotateHandleHit.rotation)) ?? '';

    return { className: null, cursor, nodeId: null };
  }
};
