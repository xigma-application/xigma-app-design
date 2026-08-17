// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getResizeHandleAtPoint } from '../../../utils/getResizeHandleAtPoint';
import { getStarCornerRadiusHandleAtPoint } from '../../../utils/getStarCornerRadiusHandleAtPoint';

export const getStarCornerRadiusHandleHit = (
  point: TPoint,
  resizeHandleHit: ReturnType<typeof getResizeHandleAtPoint>,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): ReturnType<typeof getStarCornerRadiusHandleAtPoint> =>
  resizeHandleHit ? null : getStarCornerRadiusHandleAtPoint(point, selectedNodes, viewport);
