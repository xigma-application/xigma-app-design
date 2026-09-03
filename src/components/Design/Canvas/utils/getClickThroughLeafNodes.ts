// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isClickThroughFrame } from 'store/design/utils/nodeHierarchy/isClickThroughFrame';
import { isNestedFrame } from 'store/design/utils/nodeHierarchy/isNestedFrame';

const getNearestBoundaryAncestor = (node: TSceneNode, nodesById: Record<string, TSceneNode>): TSceneNode | null => {
  let current = node.parentId ? nodesById[node.parentId] : null;

  while (current && current.type !== NodeType.frame && current.type !== NodeType.section) {
    current = current.parentId ? nodesById[current.parentId] : null;
  }

  return current ?? null;
};

const isLeafReachable = (node: TSceneNode, nodesById: Record<string, TSceneNode>): boolean => {
  const boundary = getNearestBoundaryAncestor(node, nodesById);
  return !boundary || (boundary.type === NodeType.frame && isClickThroughFrame(boundary, nodesById));
};

export const getClickThroughLeafNodes = (renderOrderedNodes: TSceneNode[], nodesById: Record<string, TSceneNode>): TSceneNode[] =>
  renderOrderedNodes.filter((node) => {
    switch (node.type) {
      case NodeType.frame:
        return node.childIds.length === 0 || isNestedFrame(node, nodesById);
      case NodeType.group:
        return node.childIds.length === 0 && isLeafReachable(node, nodesById);
      default:
        return isLeafReachable(node, nodesById);
    }
  });
