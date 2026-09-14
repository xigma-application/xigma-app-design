// types
import { TGradientEditorState } from 'store/design/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getGradientStopPositions } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawGradientHandleLayer/getGradientStopPositions';
import { getGradientWorldPoints } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawGradientHandleLayer/getGradientWorldPoints';
import { getNodeBounds } from './getNodeBounds';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isLineHandleGradientPaint } from './isLineHandleGradientPaint';

const GRADIENT_STOP_HIT_RADIUS_PX = 12;

export const getGradientStopHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
  gradientEditor: TGradientEditorState | null,
): { nodeId: string; paintIndex: number; stopIndex: number } | null => {
  const [node] = selectedNodes;

  if (gradientEditor && selectedNodes.length === 1 && node.id === gradientEditor.nodeId && isAppearanceNode(node)) {
    const paint = node.fills[gradientEditor.paintIndex];

    if (isLineHandleGradientPaint(paint)) {
      const bounds = getNodeBounds(node);
      const { end, start } = getGradientWorldPoints(bounds, node.rotation, paint);
      const positions = getGradientStopPositions(bounds, node.rotation, paint, start, end, viewport.zoom);
      const tolerance = GRADIENT_STOP_HIT_RADIUS_PX / viewport.zoom;
      const stopIndex = positions.findIndex((position) => Math.hypot(point.x - position.x, point.y - position.y) <= tolerance);

      if (stopIndex !== -1) {
        return { nodeId: node.id, paintIndex: gradientEditor.paintIndex, stopIndex };
      }
    }
  }

  return null;
};
