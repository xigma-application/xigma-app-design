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
): { bounds: TDraftRect; nodeId: string; rotation: number; sides: number } | null => {
  const [node] = selectedNodes;

  if (selectedNodes.length !== 1 || !hasPolygonCornerRadius(node)) {
    return null;
  }

  const bounds = getNodeBounds(node);

  if (!shouldShowCornerRadiusHandles(bounds, viewport)) {
    return null;
  }

  const testPoint = getUnrotatedQueryPoint(point, bounds, node.rotation);
  const tolerance = RADIUS_HANDLE_HIT_RADIUS_PX / viewport.zoom;
  const handlePosition = getPolygonCornerRadiusHandlePosition(bounds, node.sides, node.cornerRadius ?? 0, viewport);
  const distance = Math.hypot(testPoint.x - handlePosition.x, testPoint.y - handlePosition.y);

  return distance <= tolerance ? { bounds, nodeId: node.id, rotation: node.rotation, sides: node.sides } : null;
};
