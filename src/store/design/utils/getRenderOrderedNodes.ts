// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getFrameChildIdsInPaintOrder } from './getFrameChildIdsInPaintOrder';
import { isContainerNode } from './nodeHierarchy/isContainerNode';

const flattenNode = (node: TSceneNode, nodes: Record<string, TSceneNode>): TSceneNode[] => {
  if (isContainerNode(node)) {
    const childIds = node.type === NodeType.frame ? getFrameChildIdsInPaintOrder(node) : node.childIds;
    return [node, ...childIds.flatMap((childId) => (nodes[childId] ? flattenNode(nodes[childId], nodes) : []))];
  }

  return [node];
};

export const getRenderOrderedNodes = (rootOrder: string[], nodes: Record<string, TSceneNode>): TSceneNode[] =>
  rootOrder.flatMap((id) => (nodes[id] ? flattenNode(nodes[id], nodes) : []));
