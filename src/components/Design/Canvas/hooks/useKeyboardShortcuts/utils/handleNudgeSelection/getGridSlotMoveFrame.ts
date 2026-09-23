// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

export const getGridSlotMoveFrame = (selectedNodes: TSceneNode[], nodesById: Record<string, TSceneNode>): TFrameNode | null => {
  const [firstNode] = selectedNodes;
  const parent = firstNode?.parentId ? nodesById[firstNode.parentId] : undefined;
  const isCommonAnchoredGridFrame =
    selectedNodes.length > 0 &&
    selectedNodes.every((node) => node.parentId === firstNode?.parentId) &&
    parent !== undefined &&
    parent.type === NodeType.frame &&
    parent.layoutMode === LayoutMode.grid &&
    parent.gridAutoPlacement === false &&
    selectedNodes.every((node) => !(isBoxSceneNode(node) && node.ignoreAutoLayout));

  return isCommonAnchoredGridFrame ? (parent as TFrameNode) : null;
};
