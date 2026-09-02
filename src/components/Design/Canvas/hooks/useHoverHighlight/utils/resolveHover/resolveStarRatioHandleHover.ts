// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getStarRatioHandleAtPoint } from '../../../../utils/getStarRatioHandleAtPoint';

export const resolveStarRatioHandleHover = (
  point: TPoint,
  resizableSelectedNodes: TSceneNode[],
  viewport: TViewport,
  refs: TCanvasRefs,
): void => {
  refs.hover.hoveredStarRatioHandleRef.current = getStarRatioHandleAtPoint(point, resizableSelectedNodes, viewport)?.nodeId ?? null;
};
