// types
import { NodeType } from 'types/design/enums';
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
  const parentId = clipboardRoot.type === NodeType.slice ? null : target.parentId;

  return {
    nodes: cloned.nodes.map((node) => (node.id === freshRootId ? { ...node, parentId } : node)),
    rootIds: cloned.rootIds,
  };
};
