// types
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorEditingNode } from './getVectorEditingNode';

export const findVectorEditingNodeForVertex = (
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
  vertexId: string,
): TVectorNode | null =>
  vectorEditingNodeIds
    .map((id) => getVectorEditingNode(nodes, id))
    .find((node): node is TVectorNode => Boolean(node?.vertices[vertexId])) ?? null;
