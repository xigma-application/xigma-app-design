// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getPolygonVertexCountHandleAtPoint } from '../../../../utils/getPolygonVertexCountHandleAtPoint';

export const resolvePolygonVertexCountHandleHover = (
  point: TPoint,
  resizableSelectedNodes: TSceneNode[],
  viewport: TViewport,
  refs: TCanvasRefs,
): void => {
  refs.hover.hoveredPolygonVertexCountHandleRef.current =
    getPolygonVertexCountHandleAtPoint(point, resizableSelectedNodes, viewport)?.nodeId ?? null;
};
