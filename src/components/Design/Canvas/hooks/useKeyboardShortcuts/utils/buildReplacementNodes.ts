// types
import { TBoxSceneNode, TSceneNode } from 'types/design/types';

// utils
import { cloneNodeSubtreeWithOffset } from './cloneNodeSubtreeWithOffset';
import { getGroupSubtreeNodes } from 'store/design/utils/nodeHierarchy/getGroupSubtreeNodes';
import { remapClonedRootId } from './remapClonedRootId';

export type TReplacementNodes = {
  descendants: TSceneNode[];
  newRoot: TSceneNode;
};

export const buildReplacementNodes = (
  clipboardNodesById: Record<string, TSceneNode>,
  clipboardRoot: TBoxSceneNode,
  target: TBoxSceneNode,
): TReplacementNodes => {
  const subtreeNodes = getGroupSubtreeNodes(clipboardRoot, clipboardNodesById);
  const offsetX = target.x - clipboardRoot.x;
  const offsetY = target.y - clipboardRoot.y;
  const cloned = cloneNodeSubtreeWithOffset(subtreeNodes, [clipboardRoot.id], offsetX, offsetY);
  const [freshRootId] = cloned.rootIds;
  const remapped = remapClonedRootId(cloned.nodes, freshRootId, target.id, target.parentId);

  return {
    descendants: remapped.filter((node) => node.id !== target.id),
    newRoot: remapped.find((node) => node.id === target.id) as TSceneNode,
  };
};
