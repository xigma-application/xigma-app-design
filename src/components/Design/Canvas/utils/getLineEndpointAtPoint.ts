// others
import { LINE_ENDPOINT_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';
import { TLineEndpoint } from 'types/design/selectionTool/types';

export const getLineEndpointAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): { endpoint: TLineEndpoint; nodeId: string } | null => {
  const [node] = selectedNodes;

  if (selectedNodes.length === 1 && node.type === NodeType.line) {
    const radius = LINE_ENDPOINT_HANDLE_HIT_RADIUS_PX / viewport.zoom;

    if (Math.hypot(point.x - node.x1, point.y - node.y1) <= radius) {
      return { endpoint: 'a', nodeId: node.id };
    }

    if (Math.hypot(point.x - node.x2, point.y - node.y2) <= radius) {
      return { endpoint: 'b', nodeId: node.id };
    }
  }

  return null;
};
