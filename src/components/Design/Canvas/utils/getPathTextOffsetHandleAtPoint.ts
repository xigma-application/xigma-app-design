// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { isPointOnPathTextHandle } from './isPointOnPathTextHandle';

export const getPathTextOffsetHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
  nodesById: Record<string, TSceneNode>,
): { nodeId: string } | null => {
  const [node] = selectedNodes;
  let hit: { nodeId: string } | null = null;

  if (selectedNodes.length === 1 && node.type === NodeType.text && node.pathId) {
    const pathNode = nodesById[node.pathId];

    if (isPointOnPathTextHandle(point, node, viewport, pathNode)) {
      hit = { nodeId: node.id };
    }
  }

  return hit;
};
