// others
import { RADIUS_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { TCornerRadiusHandle, TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getCornerRadiusHandlePositions } from 'utils/canvas/cornerRadius/getCornerRadiusHandlePositions';
import { getNodeBounds } from './getNodeBounds';
import { getUnrotatedQueryPoint } from './getUnrotatedQueryPoint';
import { hasCornerRadius } from 'utils/canvas/cornerRadius/hasCornerRadius';
import { shouldShowCornerRadiusHandles } from 'utils/canvas/cornerRadius/shouldShowCornerRadiusHandles';

export const getCornerRadiusHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): { bounds: TDraftRect; corners: TCornerRadiusHandle[]; nodeId: string; rotation: number } | null => {
  const [node] = selectedNodes;

  if (selectedNodes.length !== 1 || !hasCornerRadius(node)) {
    return null;
  }

  const bounds = getNodeBounds(node);

  if (!shouldShowCornerRadiusHandles(bounds, viewport)) {
    return null;
  }

  const testPoint = getUnrotatedQueryPoint(point, bounds, node.rotation);
  const tolerance = RADIUS_HANDLE_HIT_RADIUS_PX / viewport.zoom;
  const positions = getCornerRadiusHandlePositions(bounds, node.cornerRadius ?? 0, viewport);
  const corners = (Object.entries(positions) as [TCornerRadiusHandle, TPoint][])
    .filter(([, handlePoint]) => Math.hypot(testPoint.x - handlePoint.x, testPoint.y - handlePoint.y) <= tolerance)
    .map(([corner]) => corner);

  return corners.length > 0 ? { bounds, corners, nodeId: node.id, rotation: node.rotation } : null;
};
