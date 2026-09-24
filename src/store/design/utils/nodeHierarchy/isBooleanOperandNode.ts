// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isVectorBoundAsTextPath } from 'utils/canvas/vector/isVectorBoundAsTextPath';

const BOOLEAN_OPERAND_TYPES = new Set<NodeType>([
  NodeType.boolean,
  NodeType.ellipse,
  NodeType.line,
  NodeType.polygon,
  NodeType.rectangle,
  NodeType.star,
  NodeType.vector,
]);

export const isBooleanOperandNode = (node: TSceneNode, nodes: Record<string, TSceneNode>): boolean =>
  BOOLEAN_OPERAND_TYPES.has(node.type) && !(node.type === NodeType.vector && isVectorBoundAsTextPath(nodes, node.id));
