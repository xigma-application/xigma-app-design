// types
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { findVectorEditingNodeForSegment } from '../../../../utils/findVectorEditingNodeForSegment';

export const getOwningSegmentNodes = (
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
  segmentIds: string[],
): TVectorNode[] => {
  const owningNodesById = new Map<string, TVectorNode>();

  segmentIds.forEach((id) => {
    const node = findVectorEditingNodeForSegment(vectorEditingNodeIds, nodes, id);

    if (node) {
      owningNodesById.set(node.id, node);
    }
  });

  return Array.from(owningNodesById.values());
};
