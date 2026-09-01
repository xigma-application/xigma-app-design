// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getEllipseArcRotateHandleAtPoint } from '../../../../utils/getEllipseArcRotateHandleAtPoint';

export const resolveEllipseArcRotateHandleHover = (
  point: TPoint,
  resizableSelectedNodes: TSceneNode[],
  viewport: TViewport,
  refs: TCanvasRefs,
): void => {
  refs.hover.hoveredEllipseArcRotateHandleRef.current =
    getEllipseArcRotateHandleAtPoint(point, resizableSelectedNodes, viewport)?.nodeId ?? null;
};
