// types
import { TGradientEditorState } from 'store/design/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getGradientEllipsePoint } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawGradientHandleLayer/getGradientEllipsePoint';
import { getGradientEndpointMoveHandleAtPoint } from './getGradientEndpointMoveHandleAtPoint';
import { getGradientRadiusHandleAtPoint } from './getGradientRadiusHandleAtPoint';
import { getGradientRotateHandleAtPoint } from './getGradientRotateHandleAtPoint';
import { getGradientStopHandleAtPoint } from './getGradientStopHandleAtPoint';
import { getNodeBounds } from './getNodeBounds';
import { getPositionAroundGradientEllipse } from './getPositionAroundGradientEllipse';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { rotatePoint } from 'utils/math/rotatePoint';
import { toNormalizedGradientPoint } from './toNormalizedGradientPoint';

const GRADIENT_ELLIPSE_HIT_TOLERANCE_PX = 8;

export const getGradientEllipsePositionAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
  gradientEditor: TGradientEditorState | null,
): { nodeId: string; paintIndex: number; position: number } | null => {
  const [node] = selectedNodes;

  if (
    gradientEditor &&
    selectedNodes.length === 1 &&
    node.id === gradientEditor.nodeId &&
    isAppearanceNode(node) &&
    !getGradientStopHandleAtPoint(point, selectedNodes, viewport, gradientEditor) &&
    !getGradientEndpointMoveHandleAtPoint(point, selectedNodes, viewport, gradientEditor) &&
    !getGradientRotateHandleAtPoint(point, selectedNodes, viewport, gradientEditor) &&
    !getGradientRadiusHandleAtPoint(point, selectedNodes, viewport, gradientEditor)
  ) {
    const paint = node.fills[gradientEditor.paintIndex];

    if (paint?.type === 'gradient-angular') {
      const bounds = getNodeBounds(node);
      const boundsCenter: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
      const localPoint = node.rotation === 0 ? point : rotatePoint(point, boundsCenter, -node.rotation);
      const normalizedPoint = toNormalizedGradientPoint(localPoint, bounds);
      const position = getPositionAroundGradientEllipse(normalizedPoint, paint.start, paint.end, paint.radiusRatio ?? 1);
      const pointOnEllipse = getGradientEllipsePoint(bounds, node.rotation, paint, position);
      const tolerance = GRADIENT_ELLIPSE_HIT_TOLERANCE_PX / viewport.zoom;

      if (Math.hypot(point.x - pointOnEllipse.x, point.y - pointOnEllipse.y) <= tolerance) {
        return { nodeId: node.id, paintIndex: gradientEditor.paintIndex, position };
      }
    }
  }

  return null;
};
