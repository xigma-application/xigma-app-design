// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getEllipseArcHandleAtPoint } from '../../../../utils/getEllipseArcHandleAtPoint';

export const resolveEllipseArcHandleHover = (
  point: TPoint,
  resizableSelectedNodes: TSceneNode[],
  viewport: TViewport,
  refs: TCanvasRefs,
): void => {
  refs.hover.hoveredEllipseArcHandleRef.current = getEllipseArcHandleAtPoint(point, resizableSelectedNodes, viewport)?.nodeId ?? null;
};
