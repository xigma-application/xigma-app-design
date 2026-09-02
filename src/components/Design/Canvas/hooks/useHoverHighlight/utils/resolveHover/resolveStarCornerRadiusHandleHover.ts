// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getStarCornerRadiusHandleAtPoint } from '../../../../utils/getStarCornerRadiusHandleAtPoint';

export const resolveStarCornerRadiusHandleHover = (
  point: TPoint,
  resizableSelectedNodes: TSceneNode[],
  viewport: TViewport,
  refs: TCanvasRefs,
): void => {
  refs.hover.hoveredStarCornerRadiusHandleRef.current =
    getStarCornerRadiusHandleAtPoint(point, resizableSelectedNodes, viewport)?.nodeId ?? null;
};
