// store
import { getGroupSubtreeNodes } from 'store/design/utils/nodeHierarchy/getGroupSubtreeNodes';

// types
import { TSceneNode } from 'types/design/types';

export const doesNodeHavePatternInSubtree = (node: TSceneNode, nodesById: Record<string, TSceneNode>): boolean =>
  getGroupSubtreeNodes(node, nodesById).some(
    (subtreeNode) => 'fills' in subtreeNode && subtreeNode.fills.some((fill) => fill.type === 'pattern'),
  );
