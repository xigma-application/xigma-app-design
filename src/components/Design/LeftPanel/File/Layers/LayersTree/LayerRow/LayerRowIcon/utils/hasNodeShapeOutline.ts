// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

const NODE_SHAPE_OUTLINE_TYPES = new Set<NodeType>([
  NodeType.ellipse,
  NodeType.line,
  NodeType.polygon,
  NodeType.rectangle,
  NodeType.star,
  NodeType.vector,
]);

export const hasNodeShapeOutline = (node: TSceneNode): boolean => NODE_SHAPE_OUTLINE_TYPES.has(node.type);
