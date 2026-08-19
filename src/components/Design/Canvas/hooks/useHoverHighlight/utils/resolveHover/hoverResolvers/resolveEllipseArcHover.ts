// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getEllipseArcHandleAtPoint } from '../../../../../utils/getEllipseArcHandleAtPoint';
import { getEllipseArcRatioHandleAtPoint } from '../../../../../utils/getEllipseArcRatioHandleAtPoint';
import { getEllipseArcRotateHandleAtPoint } from '../../../../../utils/getEllipseArcRotateHandleAtPoint';

export const resolveEllipseArcHover = ({ point, resizableSelectedNodes, viewport }: THoverResolverContext): THoverResult | undefined => {
  const ellipseArcHandleHit = getEllipseArcHandleAtPoint(point, resizableSelectedNodes, viewport);

  if (ellipseArcHandleHit) {
    return { className: 'radius', cursor: '', nodeId: ellipseArcHandleHit.nodeId };
  }

  const ellipseArcRotateHandleHit = getEllipseArcRotateHandleAtPoint(point, resizableSelectedNodes, viewport);

  if (ellipseArcRotateHandleHit) {
    return { className: 'radius', cursor: '', nodeId: ellipseArcRotateHandleHit.nodeId };
  }

  const ellipseArcRatioHandleHit = getEllipseArcRatioHandleAtPoint(point, resizableSelectedNodes, viewport);

  if (ellipseArcRatioHandleHit) {
    return { className: 'radius', cursor: '', nodeId: ellipseArcRatioHandleHit.nodeId };
  }
};
