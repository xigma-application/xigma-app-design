// types
import { NodeType } from 'types/design/enums';
import { TSvgBoxModelShapeNode, TSvgShapeNode } from './types';

const BOX_MODEL_SHAPE_TYPES: NodeType[] = [
  NodeType.frame,
  NodeType.rectangle,
  NodeType.ellipse,
  NodeType.polygon,
  NodeType.star,
  NodeType.media,
];

export const isSvgBoxModelShapeNode = (node: TSvgShapeNode): node is TSvgBoxModelShapeNode => BOX_MODEL_SHAPE_TYPES.includes(node.type);
