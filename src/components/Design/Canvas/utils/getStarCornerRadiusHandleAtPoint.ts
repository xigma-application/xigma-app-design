// others
import { RADIUS_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getNodeBounds } from './getNodeBounds';
import { getStarCornerRadiusHandlePosition } from 'utils/canvas/cornerRadius/star/getStarCornerRadiusHandlePosition';
import { getUnrotatedQueryPoint } from './getUnrotatedQueryPoint';
import { hasStarCornerRadius } from 'utils/canvas/cornerRadius/star/hasStarCornerRadius';
import { shouldShowCornerRadiusHandles } from 'utils/canvas/cornerRadius/shouldShowCornerRadiusHandles';

export const getStarCornerRadiusHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): { bounds: TDraftRect; nodeId: string; points: number; ratio: number; rotation: number } | null => {
  const [node] = selectedNodes;

  if (selectedNodes.length !== 1 || !hasStarCornerRadius(node)) {
    return null;
  }

  const bounds = getNodeBounds(node);

  if (!shouldShowCornerRadiusHandles(bounds, viewport, node.cornerRadius ?? 0)) {
    return null;
  }

  const testPoint = getUnrotatedQueryPoint(point, bounds, node.rotation);
  const tolerance = RADIUS_HANDLE_HIT_RADIUS_PX / viewport.zoom;
  const handlePosition = getStarCornerRadiusHandlePosition(bounds, node.points, node.ratio, node.cornerRadius ?? 0, viewport);
  const distance = Math.hypot(testPoint.x - handlePosition.x, testPoint.y - handlePosition.y);

  return distance <= tolerance ? { bounds, nodeId: node.id, points: node.points, ratio: node.ratio, rotation: node.rotation } : null;
};
