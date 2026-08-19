// others
import { CORNER_HANDLE_SIZE, ROTATE_HANDLE_OUTER_RADIUS_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getNodeBounds } from './getNodeBounds';
import { getRectCorners } from 'utils/canvas/getRectCorners';
import { getSelectionBounds } from './getSelectionBounds';
import { isGroupSelection } from './isGroupSelection';
import { isPointInRect } from './isPointInRect';
import { rotatePoint } from 'utils/math/rotatePoint';

const isInRotateRing = (point: TPoint, bounds: TDraftRect, viewport: TViewport): boolean => {
  if (isPointInRect(point, bounds)) {
    return false;
  }

  const innerRadius = CORNER_HANDLE_SIZE / viewport.zoom;
  const outerRadius = ROTATE_HANDLE_OUTER_RADIUS_PX / viewport.zoom;

  return getRectCorners(bounds).some((corner) => {
    const distance = Math.hypot(point.x - corner.x, point.y - corner.y);
    return distance > innerRadius && distance <= outerRadius;
  });
};

export const getRotateHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): { bounds: TDraftRect; rotation: number } | null => {
  const [singleNode] = selectedNodes;

  if (selectedNodes.length === 1 && singleNode.type !== NodeType.line && singleNode.type !== NodeType.vector) {
    const bounds = getNodeBounds(singleNode);
    const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const testPoint = singleNode.rotation === 0 ? point : rotatePoint(point, center, -singleNode.rotation);

    return isInRotateRing(testPoint, bounds, viewport) ? { bounds, rotation: singleNode.rotation } : null;
  }

  if (isGroupSelection(selectedNodes)) {
    const bounds = getSelectionBounds(selectedNodes);
    return isInRotateRing(point, bounds, viewport) ? { bounds, rotation: 0 } : null;
  }

  return null;
};
