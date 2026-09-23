// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

export const getFlowReorderFrame = (selectedNodes: TSceneNode[], nodesById: Record<string, TSceneNode>): TFrameNode | null => {
  const [firstNode] = selectedNodes;
  const parent = firstNode?.parentId ? nodesById[firstNode.parentId] : undefined;
  const isCommonFlowFrame =
    selectedNodes.length > 0 &&
    selectedNodes.every((node) => node.parentId === firstNode?.parentId) &&
    parent !== undefined &&
    parent.type === NodeType.frame &&
    (parent.layoutMode === LayoutMode.horizontal || parent.layoutMode === LayoutMode.vertical) &&
    selectedNodes.every((node) => !(isBoxSceneNode(node) && node.ignoreAutoLayout));

  return isCommonFlowFrame ? (parent as TFrameNode) : null;
};
