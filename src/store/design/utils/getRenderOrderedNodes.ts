// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

const flattenNode = (node: TSceneNode, nodes: Record<string, TSceneNode>): TSceneNode[] =>
  node.type === NodeType.group
    ? [node, ...node.childIds.flatMap((childId) => (nodes[childId] ? flattenNode(nodes[childId], nodes) : []))]
    : [node];

export const getRenderOrderedNodes = (rootOrder: string[], nodes: Record<string, TSceneNode>): TSceneNode[] =>
  rootOrder.flatMap((id) => (nodes[id] ? flattenNode(nodes[id], nodes) : []));
