// types
import { TGradientEditorState } from 'store/design/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getGradientEndpointMoveHandleAtPoint } from './getGradientEndpointMoveHandleAtPoint';
import { getGradientRotateHandleAtPoint } from './getGradientRotateHandleAtPoint';
import { getGradientStopHandleAtPoint } from './getGradientStopHandleAtPoint';
import { getGradientWorldPoints } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawGradientHandleLayer/getGradientWorldPoints';
import { getNodeBounds } from './getNodeBounds';
import { getPointAlongGradientLine } from './getPointAlongGradientLine';
import { getPositionAlongGradientLine } from './getPositionAlongGradientLine';
import { getGradientRadiusHandleAtPoint } from './getGradientRadiusHandleAtPoint';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

const GRADIENT_LINE_HIT_TOLERANCE_PX = 8;

export const getGradientLinePositionAtPoint = (
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

    if (paint?.type === 'gradient-linear' || paint?.type === 'gradient-radial' || paint?.type === 'gradient-diamond') {
      const bounds = getNodeBounds(node);
      const { end, start } = getGradientWorldPoints(bounds, node.rotation, paint);
      const position = getPositionAlongGradientLine(point, start, end);
      const pointOnLine = getPointAlongGradientLine(start, end, position);
      const tolerance = GRADIENT_LINE_HIT_TOLERANCE_PX / viewport.zoom;

      if (Math.hypot(point.x - pointOnLine.x, point.y - pointOnLine.y) <= tolerance) {
        return { nodeId: node.id, paintIndex: gradientEditor.paintIndex, position };
      }
    }
  }

  return null;
};
