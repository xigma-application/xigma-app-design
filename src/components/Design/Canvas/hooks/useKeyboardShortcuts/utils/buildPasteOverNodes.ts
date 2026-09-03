// types
import { TBoxSceneNode, TSceneNode } from 'types/design/types';

// utils
import { cloneNodeSubtreeWithOffset, TClonedSubtree } from './cloneNodeSubtreeWithOffset';
import { getGroupSubtreeNodes } from 'store/design/utils/nodeHierarchy/getGroupSubtreeNodes';

export const buildPasteOverNodes = (
  clipboardNodesById: Record<string, TSceneNode>,
  clipboardRoot: TBoxSceneNode,
  target: TBoxSceneNode,
): TClonedSubtree => {
  const subtreeNodes = getGroupSubtreeNodes(clipboardRoot, clipboardNodesById);
  const offsetX = target.x - clipboardRoot.x;
  const offsetY = target.y - clipboardRoot.y;
  const cloned = cloneNodeSubtreeWithOffset(subtreeNodes, [clipboardRoot.id], offsetX, offsetY);
  const [freshRootId] = cloned.rootIds;

  return {
    nodes: cloned.nodes.map((node) => (node.id === freshRootId ? { ...node, parentId: target.parentId } : node)),
    rootIds: cloned.rootIds,
  };
};
