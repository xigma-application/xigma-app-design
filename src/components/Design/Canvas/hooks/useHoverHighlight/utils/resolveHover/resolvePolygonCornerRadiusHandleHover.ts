// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getPolygonCornerRadiusHandleAtPoint } from '../../../../utils/getPolygonCornerRadiusHandleAtPoint';

export const resolvePolygonCornerRadiusHandleHover = (
  point: TPoint,
  resizableSelectedNodes: TSceneNode[],
  viewport: TViewport,
  refs: TCanvasRefs,
): void => {
  refs.hover.hoveredPolygonCornerRadiusHandleRef.current =
    getPolygonCornerRadiusHandleAtPoint(point, resizableSelectedNodes, viewport)?.nodeId ?? null;
};
