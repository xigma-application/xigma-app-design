// others
import { ELLIPSE_ARC_MAX_RATIO, ELLIPSE_DEFAULT_ARC_ANGLE, RADIUS_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getEllipseArcHandlePosition } from 'utils/canvas/ellipseArc/getEllipseArcHandlePosition';
import { getNodeBounds } from './getNodeBounds';
import { getUnrotatedQueryPoint } from './getUnrotatedQueryPoint';
import { shouldShowEllipseArcHandle } from 'utils/canvas/ellipseArc/shouldShowEllipseArcHandle';

export const getEllipseArcHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): { bounds: TDraftRect; flipX: boolean; flipY: boolean; nodeId: string; rotation: number } | null => {
  const [node] = selectedNodes;

  if (selectedNodes.length !== 1 || node.type !== NodeType.ellipse) {
    return null;
  }

  const bounds = getNodeBounds(node);

  if (!shouldShowEllipseArcHandle(bounds, viewport)) {
    return null;
  }

  const testPoint = getUnrotatedQueryPoint(point, bounds, node.rotation);
  const tolerance = RADIUS_HANDLE_HIT_RADIUS_PX / viewport.zoom;
  const arcEndAngle = node.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
  const arcRatio = Math.min(Math.max(node.arcRatio ?? 0, 0), ELLIPSE_ARC_MAX_RATIO);
  const handlePosition = getEllipseArcHandlePosition(bounds, arcEndAngle, node.flipX, node.flipY, arcRatio);
  const distance = Math.hypot(testPoint.x - handlePosition.x, testPoint.y - handlePosition.y);

  return distance <= tolerance
    ? { bounds, flipX: node.flipX ?? false, flipY: node.flipY ?? false, nodeId: node.id, rotation: node.rotation }
    : null;
};
