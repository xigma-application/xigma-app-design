// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

export const getVectorEditingNode = (nodes: Record<string, TSceneNode>, nodeId: string | null): TVectorNode | null => {
  const node = nodeId ? nodes[nodeId] : undefined;
  return node && node.type === NodeType.vector ? node : null;
};
