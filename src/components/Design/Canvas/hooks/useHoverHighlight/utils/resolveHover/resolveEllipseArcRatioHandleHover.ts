// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getEllipseArcRatioHandleAtPoint } from '../../../../utils/getEllipseArcRatioHandleAtPoint';

export const resolveEllipseArcRatioHandleHover = (
  point: TPoint,
  resizableSelectedNodes: TSceneNode[],
  viewport: TViewport,
  refs: TCanvasRefs,
): void => {
  refs.hover.hoveredEllipseArcRatioHandleRef.current =
    getEllipseArcRatioHandleAtPoint(point, resizableSelectedNodes, viewport)?.nodeId ?? null;
};
