// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientEditorState } from 'store/design/types';
import { TGradientRotateEndpoint } from 'types/design/canvas/types';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getGradientEndpointMoveHandleAtPoint, GRADIENT_ENDPOINT_MOVE_RADIUS_PX } from './getGradientEndpointMoveHandleAtPoint';
import { getGradientStopHandleAtPoint } from './getGradientStopHandleAtPoint';
import { getGradientWorldPoints } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawGradientHandleLayer/getGradientWorldPoints';
import { getNodeBounds } from './getNodeBounds';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isLineHandleGradientPaint } from './isLineHandleGradientPaint';
import { getNodePaints } from 'utils/design/paint/getNodePaints';

export const GRADIENT_ROTATE_HANDLE_RADIUS_PX = 10;

export type TGradientRotateHandleHit = {
  bounds: TDraftRect;
  endpoint: TGradientRotateEndpoint;
  nodeId: string;
  paintIndex: number;
  rotation: number;
};

export const getGradientRotateHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
  gradientEditor: TGradientEditorState | null,
): TGradientRotateHandleHit | null => {
  const [node] = selectedNodes;

  if (
    gradientEditor &&
    selectedNodes.length === 1 &&
    node.id === gradientEditor.nodeId &&
    isAppearanceNode(node) &&
    !getGradientStopHandleAtPoint(point, selectedNodes, viewport, gradientEditor) &&
    !getGradientEndpointMoveHandleAtPoint(point, selectedNodes, viewport, gradientEditor)
  ) {
    const paint = getNodePaints(node, gradientEditor.property)[gradientEditor.paintIndex];

    if (isLineHandleGradientPaint(paint)) {
      const bounds = getNodeBounds(node);
      const { end, start } = getGradientWorldPoints(bounds, node.rotation, paint);
      const innerRadius = GRADIENT_ENDPOINT_MOVE_RADIUS_PX / viewport.zoom;
      const outerRadius = GRADIENT_ROTATE_HANDLE_RADIUS_PX / viewport.zoom;
      const distanceToStart = Math.hypot(point.x - start.x, point.y - start.y);
      const distanceToEnd = Math.hypot(point.x - end.x, point.y - end.y);
      const hitsStartRing = distanceToStart > innerRadius && distanceToStart <= outerRadius;
      const hitsEndRing = distanceToEnd > innerRadius && distanceToEnd <= outerRadius;

      if (hitsStartRing || hitsEndRing) {
        const endpoint: TGradientRotateEndpoint = distanceToStart <= distanceToEnd ? 'start' : 'end';
        return { bounds, endpoint, nodeId: node.id, paintIndex: gradientEditor.paintIndex, rotation: node.rotation };
      }
    }
  }

  return null;
};
