// types
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TVectorHandleHover } from 'types/design/canvas/types';

// utils
import { getVectorEditingNode } from './getVectorEditingNode';

export const getVectorMultiSelectOwningNode = (
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
  selectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
): TVectorNode | null =>
  vectorEditingNodeIds
    .map((id) => getVectorEditingNode(nodes, id))
    .find(
      (node): node is TVectorNode =>
        node !== null &&
        selectedVertexIds.every((id) => node.vertices[id]) &&
        selectedHandles.every((handle) => node.segments[handle.segmentId]),
    ) ?? null;
