// types
import { NodeType } from 'types/design/enums';
import { TStrokeableNode } from './types';

export const getStrokeOutlineRotation = (node: TStrokeableNode): number => {
  switch (node.type) {
    case NodeType.ellipse:
    case NodeType.line:
    case NodeType.polygon:
    case NodeType.star:
      return 0;
    default:
      return node.rotation;
  }
};
