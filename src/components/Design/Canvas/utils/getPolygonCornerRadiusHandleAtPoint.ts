// others
import { RADIUS_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getNodeBounds } from './getNodeBounds';
import { getPolygonCornerRadiusHandlePosition } from 'utils/canvas/cornerRadius/polygon/getPolygonCornerRadiusHandlePosition';
import { getUnrotatedQueryPoint } from './getUnrotatedQueryPoint';
import { hasPolygonCornerRadius } from 'utils/canvas/cornerRadius/polygon/hasPolygonCornerRadius';
import { shouldShowCornerRadiusHandles } from 'utils/canvas/cornerRadius/shouldShowCornerRadiusHandles';

export const getPolygonCornerRadiusHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): { bounds: TDraftRect; flipX: boolean; flipY: boolean; nodeId: string; rotation: number; sides: number } | null => {
  const [node] = selectedNodes;

  if (selectedNodes.length !== 1 || !hasPolygonCornerRadius(node)) {
    return null;
  }

  const bounds = getNodeBounds(node);

  if (!shouldShowCornerRadiusHandles(bounds, viewport, node.cornerRadius ?? 0)) {
    return null;
  }

  const testPoint = getUnrotatedQueryPoint(point, bounds, node.rotation);
  const tolerance = RADIUS_HANDLE_HIT_RADIUS_PX / viewport.zoom;
  const handlePosition = getPolygonCornerRadiusHandlePosition(bounds, node.sides, node.cornerRadius ?? 0, viewport, node.flipX, node.flipY);
  const distance = Math.hypot(testPoint.x - handlePosition.x, testPoint.y - handlePosition.y);

  return distance <= tolerance
    ? { bounds, flipX: node.flipX, flipY: node.flipY, nodeId: node.id, rotation: node.rotation, sides: node.sides }
    : null;
};
