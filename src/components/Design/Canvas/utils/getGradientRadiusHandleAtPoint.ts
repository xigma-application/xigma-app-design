// types
import { TGradientEditorState } from 'store/design/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getGradientEndpointMoveHandleAtPoint } from './getGradientEndpointMoveHandleAtPoint';
import { getGradientRadiusHandleWorldPoint } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawGradientHandleLayer/getGradientRadiusHandleWorldPoint';
import { getGradientStopHandleAtPoint } from './getGradientStopHandleAtPoint';
import { getNodeBounds } from './getNodeBounds';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isEllipseHandleGradientPaint } from './isEllipseHandleGradientPaint';

export const GRADIENT_RADIUS_HANDLE_RADIUS_PX = 6;

export type TGradientRadiusHandleHit = { nodeId: string; paintIndex: number };

export const getGradientRadiusHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
  gradientEditor: TGradientEditorState | null,
): TGradientRadiusHandleHit | null => {
  const [node] = selectedNodes;

  if (
    gradientEditor &&
    selectedNodes.length === 1 &&
    node.id === gradientEditor.nodeId &&
    isAppearanceNode(node) &&
    !getGradientStopHandleAtPoint(point, selectedNodes, viewport, gradientEditor) &&
    !getGradientEndpointMoveHandleAtPoint(point, selectedNodes, viewport, gradientEditor)
  ) {
    const paint = node.fills[gradientEditor.paintIndex];

    if (isEllipseHandleGradientPaint(paint)) {
      const bounds = getNodeBounds(node);
      const handleWorldPoint = getGradientRadiusHandleWorldPoint(bounds, node.rotation, paint);
      const tolerance = GRADIENT_RADIUS_HANDLE_RADIUS_PX / viewport.zoom;

      if (Math.hypot(point.x - handleWorldPoint.x, point.y - handleWorldPoint.y) <= tolerance) {
        return { nodeId: node.id, paintIndex: gradientEditor.paintIndex };
      }
    }
  }

  return null;
};
