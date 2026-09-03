// types
import { TSceneNode } from 'types/design/types';

// utils
import { isContainerNode } from './nodeHierarchy/isContainerNode';

const flattenNode = (node: TSceneNode, nodes: Record<string, TSceneNode>): TSceneNode[] =>
  isContainerNode(node)
    ? [node, ...node.childIds.flatMap((childId) => (nodes[childId] ? flattenNode(nodes[childId], nodes) : []))]
    : [node];

export const getRenderOrderedNodes = (rootOrder: string[], nodes: Record<string, TSceneNode>): TSceneNode[] =>
  rootOrder.flatMap((id) => (nodes[id] ? flattenNode(nodes[id], nodes) : []));
