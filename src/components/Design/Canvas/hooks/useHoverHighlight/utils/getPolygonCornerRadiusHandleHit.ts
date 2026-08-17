// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getPolygonCornerRadiusHandleAtPoint } from '../../../utils/getPolygonCornerRadiusHandleAtPoint';
import { getResizeHandleAtPoint } from '../../../utils/getResizeHandleAtPoint';

export const getPolygonCornerRadiusHandleHit = (
  point: TPoint,
  resizeHandleHit: ReturnType<typeof getResizeHandleAtPoint>,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): ReturnType<typeof getPolygonCornerRadiusHandleAtPoint> =>
  resizeHandleHit ? null : getPolygonCornerRadiusHandleAtPoint(point, selectedNodes, viewport);
