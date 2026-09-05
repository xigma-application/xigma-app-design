// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isVectorBoundAsTextPath } from 'utils/canvas/vector/isVectorBoundAsTextPath';

export const getAlreadyVectorNodeIds = (selectedNodes: TSceneNode[], nodesById: Record<string, TSceneNode>): string[] =>
  selectedNodes.filter((node) => node.type === NodeType.vector && !isVectorBoundAsTextPath(nodesById, node.id)).map((node) => node.id);
