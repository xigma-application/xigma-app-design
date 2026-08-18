// others
import { ELLIPSE_ARC_MAX_RATIO, ELLIPSE_DEFAULT_ARC_ANGLE, RADIUS_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getEllipseArcMajorArc } from 'utils/canvas/ellipseArc/getEllipseArcMajorArc';
import { getEllipseArcRatioHandlePosition } from 'utils/canvas/ellipseArc/getEllipseArcRatioHandlePosition';
import { getNodeBounds } from './getNodeBounds';
import { getUnrotatedQueryPoint } from './getUnrotatedQueryPoint';
import { shouldShowEllipseArcHandle } from 'utils/canvas/ellipseArc/shouldShowEllipseArcHandle';

export const getEllipseArcRatioHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): { bounds: TDraftRect; flipX: boolean; flipY: boolean; nodeId: string; rotation: number } | null => {
  const [node] = selectedNodes;
  const isEllipse = selectedNodes.length === 1 && node.type === NodeType.ellipse;
  const bounds = isEllipse ? getNodeBounds(node) : null;

  if (isEllipse && bounds && shouldShowEllipseArcHandle(bounds, viewport)) {
    const arcStartAngle = node.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
    const arcEndAngle = node.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;

    if (getEllipseArcMajorArc(arcStartAngle, arcEndAngle).majorSweep !== 0) {
      const arcRatio = Math.min(Math.max(node.arcRatio ?? 0, 0), ELLIPSE_ARC_MAX_RATIO);
      const testPoint = getUnrotatedQueryPoint(point, bounds, node.rotation);
      const tolerance = RADIUS_HANDLE_HIT_RADIUS_PX / viewport.zoom;
      const handlePosition = getEllipseArcRatioHandlePosition(
        bounds,
        arcStartAngle,
        arcEndAngle,
        arcRatio,
        node,
        node.arcRatioInverted ?? false,
      );

      return Math.hypot(testPoint.x - handlePosition.x, testPoint.y - handlePosition.y) <= tolerance
        ? { bounds, flipX: node.flipX ?? false, flipY: node.flipY ?? false, nodeId: node.id, rotation: node.rotation }
        : null;
    }
  }

  return null;
};
