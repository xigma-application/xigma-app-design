// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getCornerRadiusHandleAtPoint } from '../../../../../utils/getCornerRadiusHandleAtPoint';
import { getPolygonCornerRadiusHandleHit } from '../../getPolygonCornerRadiusHandleHit';
import { getStarCornerRadiusHandleHit } from '../../getStarCornerRadiusHandleHit';

export const resolveCornerRadiusHover = ({
  point,
  resizableSelectedNodes,
  viewport,
  resizeHandleHit,
}: THoverResolverContext): THoverResult | undefined => {
  const cornerRadiusHandleHit = getCornerRadiusHandleAtPoint(point, resizableSelectedNodes, viewport);

  if (cornerRadiusHandleHit) {
    return { className: 'radius', cursor: '', nodeId: cornerRadiusHandleHit.nodeId };
  }

  const polygonCornerRadiusHandleHit = getPolygonCornerRadiusHandleHit(point, resizeHandleHit, resizableSelectedNodes, viewport);

  if (polygonCornerRadiusHandleHit) {
    return { className: 'radius', cursor: '', nodeId: polygonCornerRadiusHandleHit.nodeId };
  }

  const starCornerRadiusHandleHit = getStarCornerRadiusHandleHit(point, resizeHandleHit, resizableSelectedNodes, viewport);

  if (starCornerRadiusHandleHit) {
    return { className: 'radius', cursor: '', nodeId: starCornerRadiusHandleHit.nodeId };
  }
};
