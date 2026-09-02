// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getCornerRadiusHandleAtPoint } from '../../../../utils/getCornerRadiusHandleAtPoint';

export const resolveCornerRadiusHandleHover = (
  point: TPoint,
  resizableSelectedNodes: TSceneNode[],
  viewport: TViewport,
  refs: TCanvasRefs,
): void => {
  const hit = getCornerRadiusHandleAtPoint(point, resizableSelectedNodes, viewport);

  refs.hover.hoveredCornerRadiusHandleRef.current = hit ? { corner: hit.corners[0], nodeId: hit.nodeId } : null;
};
