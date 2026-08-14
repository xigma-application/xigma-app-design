// others
import { LINE_ENDPOINT_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getPathTextHandlePoint } from './getPathTextHandlePoint';

export const getPathTextOffsetHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): { nodeId: string } | null => {
  const [node] = selectedNodes;
  let hit: { nodeId: string } | null = null;

  if (selectedNodes.length === 1 && node.type === NodeType.text && node.pathId) {
    const handlePoint = getPathTextHandlePoint(node);
    const radius = LINE_ENDPOINT_HANDLE_HIT_RADIUS_PX / viewport.zoom;

    if (handlePoint && Math.hypot(point.x - handlePoint.x, point.y - handlePoint.y) <= radius) {
      hit = { nodeId: node.id };
    }
  }

  return hit;
};
