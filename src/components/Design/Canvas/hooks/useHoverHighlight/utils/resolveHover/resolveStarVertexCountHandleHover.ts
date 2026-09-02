// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getStarVertexCountHandleAtPoint } from '../../../../utils/getStarVertexCountHandleAtPoint';

export const resolveStarVertexCountHandleHover = (
  point: TPoint,
  resizableSelectedNodes: TSceneNode[],
  viewport: TViewport,
  refs: TCanvasRefs,
): void => {
  refs.hover.hoveredStarVertexCountHandleRef.current =
    getStarVertexCountHandleAtPoint(point, resizableSelectedNodes, viewport)?.nodeId ?? null;
};
