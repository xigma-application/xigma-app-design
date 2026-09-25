// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getGradientRotateHandleAtPoint } from '../../../../../utils/getGradientRotateHandleAtPoint';
import { getRotateCursorAngle } from 'utils/math/getRotateCursorAngle';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';

export const resolveGradientRotateHover = ({
  gradientEditor,
  point,
  refs,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getGradientRotateHandleAtPoint(point, selectedNodes, viewport, gradientEditor);
  setRef(refs.hover, 'hoveredGradientRotateEndpointRef', hit ? { endpoint: hit.endpoint, pointerPosition: point } : null);

  if (hit) {
    const cursor = getRotatedCursorUrl('rotate', getRotateCursorAngle(point, hit.bounds, hit.rotation)) ?? '';
    return { className: null, cursor, nodeId: hit.nodeId };
  }
};
