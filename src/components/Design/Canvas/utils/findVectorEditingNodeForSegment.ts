// types
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorEditingNode } from './getVectorEditingNode';

export const findVectorEditingNodeForSegment = (
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
  segmentId: string,
): TVectorNode | null =>
  vectorEditingNodeIds
    .map((id) => getVectorEditingNode(nodes, id))
    .find((node): node is TVectorNode => Boolean(node?.segments[segmentId])) ?? null;
